const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { execFileSync } = require('child_process');
const { query, closeDb } = require('../db');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

function parseSqlStatements(sqlText) {
  return sqlText
    .split(/\r?\n/)
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function seedDb() {
  const setupSchemaScript = path.join(__dirname, 'create-schema.js');
  execFileSync(process.execPath, [setupSchemaScript], { stdio: 'inherit' });
  const seedFile = process.env.DB_SEED_FILE || 'seed.sql';
  const seedPath = path.join(__dirname, '..', 'database', seedFile);
  const seedSql = fs.readFileSync(seedPath, 'utf8');

  const statements = parseSqlStatements(seedSql);

  console.log(`Executing ${seedFile}... Found ${statements.length} statements`);

  for (const statement of statements) {
    try {
      await query(statement);
    } catch (error) {
      console.error(`\n❌ ERROR EXECUTING STATEMENT:\n${statement}\n`);
      throw error; 
    }
  }

  console.log(`✅ ${seedFile} executed successfully`);
}

seedDb().catch((error) => {
  console.error('Database seed failed:', error.message);
  process.exit(1);
}).finally(async () => {
  await closeDb();
});