const { query } = require('../../db');

async function listCategories() {
  return query(
    `SELECT c.id, c.name,
            LISTAGG(pc.product_id, ',') WITHIN GROUP (ORDER BY pc.product_id) AS productids
     FROM categories c
     LEFT JOIN product_categories pc ON c.id = pc.category_id
     GROUP BY c.id, c.name
     ORDER BY c.name ASC`
  );
}

async function findCategoryById(id) {
  const rows = await query(
    `SELECT c.id, c.name,
            LISTAGG(pc.product_id, ',') WITHIN GROUP (ORDER BY pc.product_id) AS productids
     FROM categories c
     LEFT JOIN product_categories pc ON c.id = pc.category_id
     WHERE c.id = ?
     GROUP BY c.id, c.name`,
    [id]
  );
  return rows[0] || null;
}

async function findCategoryByName(name) {
  const rows = await query(
    'SELECT * FROM categories WHERE LOWER(name) = LOWER(?) FETCH FIRST 1 ROWS ONLY',
    [name]
  );
  return rows[0] || null;
}

async function createCategory(name) {
  await query('INSERT INTO categories (name) VALUES (?)', [name]);
  return findCategoryByName(name);
}

async function updateCategoryName(id, name) {
  const result = await query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
  return result;
}

async function deleteCategory(id) {
  return query('DELETE FROM categories WHERE id = ?', [id]);
}

module.exports = {
  listCategories,
  findCategoryById,
  findCategoryByName,
  createCategory,
  updateCategoryName,
  deleteCategory,
};
