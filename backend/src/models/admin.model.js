const { query } = require('../../db');
const fs = require('fs/promises');
const path = require('path');

async function runAdminQuery(sql, params = []) {
  return query(sql, params);
}

async function readDatabaseSchema() {
  const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
  return fs.readFile(schemaPath, 'utf8');
}

module.exports = {
  runAdminQuery,
  readDatabaseSchema,
};
