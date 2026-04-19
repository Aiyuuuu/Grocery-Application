const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function seedDb() {
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = Number(process.env.DB_PORT || 3306);
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';

  const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
  const seedSql = fs.readFileSync(seedPath, 'utf8');

  const connection = await mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    multipleStatements: true,
  });

  try {
    await connection.query(seedSql);
    console.log('Database seeded successfully from database/seed.sql');
  } finally {
    await connection.end();
  }
}

seedDb().catch((error) => {
  console.error('Database seed failed:', error.message);
  console.error('Check your MySQL server status and backend/.env credentials.');
  process.exit(1);
});
