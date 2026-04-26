const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { execFileSync } = require('child_process');
const { query, closeDb } = require('../db');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

function parseSqlStatements(sqlText) {
  const lines = sqlText.split(/\r?\n/);
  const statements = [];
  let buffer = [];
  let inPlSqlBlock = false;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (trimmed.startsWith('--')) {
      continue;
    }

    if (!inPlSqlBlock && /^CREATE\s+OR\s+REPLACE\s+TRIGGER\b/i.test(trimmed)) {
      inPlSqlBlock = true;
      buffer.push(rawLine);
      continue;
    }

    if (inPlSqlBlock) {
      if (trimmed === '/') {
        const statement = buffer.join('\n').trim();
        if (statement) statements.push(statement);
        buffer = [];
        inPlSqlBlock = false;
      } else {
        buffer.push(rawLine);
      }
      continue;
    }

    if (!trimmed) {
      continue;
    }

    buffer.push(rawLine);

    if (trimmed.endsWith(';')) {
      const statement = buffer.join('\n').trim().replace(/;\s*$/, '');
      if (statement) statements.push(statement);
      buffer = [];
    }
  }

  const trailing = buffer.join('\n').trim();
  if (trailing) {
    statements.push(trailing.replace(/;\s*$/, ''));
  }

  return statements;
}

async function executeSqlFile(filePath, description) {
  const sql = fs.readFileSync(filePath, 'utf8');
  const statements = parseSqlStatements(sql);

  console.log(`Executing ${description}... Found ${statements.length} statements`);
  
  for (let i = 0; i < statements.length; i++) {
    try {
      await query(statements[i]);
    } catch (error) {
      if (error.errorNum !== 955) { // 955 = Object (Table) already exists
        console.error(`\n❌ Error in statement ${i + 1}:\n${statements[i]}\n`);
        throw error;
      }
    }
  }
  console.log(`✅ ${description} completed successfully`);
}

async function initDb() {
  const setupSchemaScript = path.join(__dirname, 'create-schema.js');
  execFileSync(process.execPath, [setupSchemaScript], { stdio: 'inherit' });

  const schemaFile = process.env.DB_SCHEMA_FILE || 'schema.sql';
  const schemaPath = path.join(__dirname, '..', 'database', schemaFile);
  await executeSqlFile(schemaPath, schemaFile);

  console.log('🎉 Database initialization entirely finished!');
}

initDb().catch((error) => {
  console.error('Database init failed:', error.message);
  process.exit(1);
}).finally(async () => {
  await closeDb();
});