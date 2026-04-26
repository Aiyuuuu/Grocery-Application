const path = require('path');
const dotenv = require('dotenv');
const oracledb = require('oracledb');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectString = process.env.DB_CONNECT_STRING || `${process.env.DB_HOST || 'localhost'}:${Number(process.env.DB_PORT || 1521)}/${process.env.DB_SERVICE_NAME || 'XEPDB1'}`;

async function run() {
  const appUser = (process.env.DB_USER || 'GROCERY_APP').toUpperCase();
  const appPassword = process.env.DB_PASSWORD || 'grocery_app';
  const adminUser = process.env.ADMIN_DB_USER || 'SYSTEM';
  const adminPassword = process.env.ADMIN_DB_PASSWORD || '';

  const connection = await oracledb.getConnection({
    user: adminUser,
    password: adminPassword,
    connectString,
  });

  try {
    try {
      await connection.execute(`CREATE USER ${appUser} IDENTIFIED BY "${appPassword}"`);
      console.log(`✅ Schema user ${appUser} created`);
    } catch (error) {
      if (error.errorNum !== 1920) throw error; // 1920 = user already exists
      console.log(`ℹ️  Schema user ${appUser} already exists`);
    }

    await connection.execute(`ALTER USER ${appUser} QUOTA UNLIMITED ON USERS`);
    await connection.execute(`GRANT CREATE SESSION, CREATE TABLE, CREATE VIEW, CREATE SEQUENCE, CREATE PROCEDURE, CREATE TRIGGER TO ${appUser}`);
    await connection.commit();

    console.log(`✅ Schema grants applied for ${appUser}`);
  } finally {
    await connection.close();
  }
}

run().catch((error) => {
  console.error('Schema setup failed:', error.message);
  process.exit(1);
});