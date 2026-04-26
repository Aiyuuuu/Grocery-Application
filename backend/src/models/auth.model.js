const { query } = require('../../db');

async function findUserIdByEmail(email) {
  const rows = await query(
    'SELECT id FROM users WHERE email = ? FETCH FIRST 1 ROWS ONLY',
    [email]
  ); 
  return rows[0] || null;
}

async function createUser(firstName, lastName, email, password, role) {
  const effectiveRole = role || 'customer';

  await query(
    'INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)',
    [firstName, lastName, email, password, effectiveRole]
  );
}

async function findUserPublicByEmail(email) {
  const rows = await query(
    'SELECT id, first_name, last_name, email, role FROM users WHERE email = ? FETCH FIRST 1 ROWS ONLY',
    [email]
  );
  return rows[0] || null;
}

async function findUserWithPasswordByEmail(email) {
  const rows = await query(
    'SELECT id, first_name, last_name, email, role, password, is_active FROM users WHERE email = ? FETCH FIRST 1 ROWS ONLY',
    [email]
  );
  return rows[0] || null;
}

async function findActiveUserById(id) {
  const rows = await query(
    `SELECT id, first_name, last_name, email, role
     FROM users
     WHERE id = ? AND is_active = 'true'
     FETCH FIRST 1 ROWS ONLY`,
    [id]
  );

  return rows[0] || null;
}

async function findUserById(id) {
  const rows = await query(
    `SELECT id, first_name, last_name, email, role, is_active
     FROM users
     WHERE id = ?
     FETCH FIRST 1 ROWS ONLY`,
    [id]
  );

  return rows[0] || null;
}

async function promoteUserToAdmin(id) {
  return query(
    "UPDATE users SET role = 'admin' WHERE id = ?",
    [id]
  );
}

module.exports = {
  findUserIdByEmail,
  createUser,
  findUserPublicByEmail,
  findUserWithPasswordByEmail,
  findActiveUserById,
  findUserById,
  promoteUserToAdmin,
};
