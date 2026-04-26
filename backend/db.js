const path = require('path');
const dotenv = require('dotenv');
const oracledb = require('oracledb');

dotenv.config({ path: path.join(__dirname, '.env') });

const connectString = process.env.DB_CONNECT_STRING
  || `${process.env.DB_HOST}:${Number(process.env.DB_PORT)}/${process.env.DB_SERVICE_NAME}`;

let poolPromise;

function getPool() {
  if (!poolPromise) {
    poolPromise = oracledb.createPool({
      user: process.env.DB_USER || 'GROCERY_APP',
      password: process.env.DB_PASSWORD || 'grocery_app',
      connectString,
      poolMin: 1,
      poolMax: 10,
      poolIncrement: 1,
    });
  }
  return poolPromise;
}

function convertPlaceholders(sql, params = []) {
  const binds = {};
  let bindCounter = 0;
  let paramCursor = 0;
  let convertedSql = '';
  let inString = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];

    if (char === "'") {
      inString = !inString;
    }

    if (char === '?' && !inString) {
      const value = params[paramCursor];
      paramCursor += 1;
      bindCounter += 1;
      const name = `b${bindCounter}`;
      binds[name] = value;
      convertedSql += `:${name}`;
      continue;
    }

    convertedSql += char;
  }

  return { sql: convertedSql, binds };
}

function normalizeRowKeys(row) {
  const normalized = {};
  for (const [key, value] of Object.entries(row)) {
    normalized[key.toLowerCase()] = value;
  }
  return normalized;
}

async function execute(conn, sql, params = []) {
  const { sql: convertedSql, binds } = convertPlaceholders(sql, params);
  const isSelect = /^\s*SELECT\b/i.test(convertedSql);

  const result = await conn.execute(convertedSql, binds, {
    autoCommit: !isSelect,
    outFormat: oracledb.OUT_FORMAT_OBJECT,
  });

  if (isSelect) {
    return (result.rows || []).map(normalizeRowKeys);
  }

  return { affectedRows: result.rowsAffected || 0 };
}

async function query(sql, params = []) {
  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    return await execute(connection, sql, params);
  } finally {
    await connection.close();
  }
}

async function checkDbConnection() {
  const pool = await getPool();
  const connection = await pool.getConnection();
  await connection.execute('SELECT 1 FROM dual');
  await connection.close();
}

async function getConnection() {
  const pool = await getPool();
  const connection = await pool.getConnection();
  let inTransaction = false;

  return {
    async beginTransaction() {
      inTransaction = true;
    },
    async commit() {
      await connection.commit();
      inTransaction = false;
    },
    async rollback() {
      await connection.rollback();
      inTransaction = false;
    },
    async query(sql, params = []) {
      const { sql: convertedSql, binds } = convertPlaceholders(sql, params);
      const isSelect = /^\s*SELECT\b/i.test(convertedSql);

      const result = await connection.execute(convertedSql, binds, {
        autoCommit: !isSelect && !inTransaction,
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });

      if (isSelect) {
        return (result.rows || []).map(normalizeRowKeys);
      }

      return { affectedRows: result.rowsAffected || 0 };
    },
    async release() {
      await connection.close();
    },
  };
}

async function closeDb() {
  if (poolPromise) {
    const pool = await poolPromise;
    await pool.close(0);
    poolPromise = null;
  }
}

module.exports = {
  query,
  checkDbConnection,
  getConnection,
  closeDb,
};
