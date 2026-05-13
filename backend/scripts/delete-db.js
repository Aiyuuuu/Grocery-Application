const path = require('path');
const dotenv = require('dotenv');
const oracledb = require('oracledb');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectString = process.env.DB_CONNECT_STRING
  || `${process.env.DB_HOST || 'localhost'}:${Number(process.env.DB_PORT || 1521)}/${process.env.DB_SERVICE_NAME || 'XEPDB1'}`;

async function killUserSessions(connection, username) {
  // Best-effort session cleanup. May fail if the admin user lacks access to V$SESSION.
  const sessions = await connection.execute(
    `SELECT sid, serial#
     FROM v$session
     WHERE username = :username`,
    { username }
  );

  for (const row of sessions.rows || []) {
    const sid = row[0];
    const serial = row[1];
    try {
      await connection.execute(`ALTER SYSTEM KILL SESSION '${sid},${serial}' IMMEDIATE`);
    } catch (_error) {
      // Ignore and continue.
    }
  }
}

async function dropAppUser() {
  const appUser = (process.env.DB_USER || 'GROCERY_APP').toUpperCase();
  const adminUser = process.env.ADMIN_DB_USER || 'SYSTEM';
  const adminPassword = process.env.ADMIN_DB_PASSWORD || '';

  const connection = await oracledb.getConnection({
    user: adminUser,
    password: adminPassword,
    connectString,
  });

  try {
    try {
      await connection.execute(`DROP USER ${appUser} CASCADE`);
      await connection.commit();
      console.log(`✅ Dropped schema user ${appUser} (CASCADE)`);
      return;
    } catch (error) {
      // ORA-01918: user does not exist
      if (error.errorNum === 1918) {
        console.log(`ℹ️  Schema user ${appUser} does not exist (nothing to drop)`);
        return;
      }

      // ORA-01940: cannot drop a user that is currently connected
      if (error.errorNum === 1940) {
        console.log(`ℹ️  ${appUser} has active sessions; attempting to kill sessions...`);

        try {
          await killUserSessions(connection, appUser);
        } catch (killError) {
          console.error(
            `❌ Unable to kill sessions for ${appUser}. `
            + 'Ensure your admin user has privileges to query v$session and kill sessions.'
          );
          throw killError;
        }

        await connection.execute(`DROP USER ${appUser} CASCADE`);
        await connection.commit();
        console.log(`✅ Dropped schema user ${appUser} (CASCADE) after killing sessions`);
        return;
      }

      throw error;
    }
  } finally {
    await connection.close();
  }
}

dropAppUser().catch((error) => {
  console.error('Database drop failed:', error.message);
  process.exit(1);
});
