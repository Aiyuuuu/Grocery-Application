const { query, getConnection } = require('../../db');

function buildInClausePlaceholders(length) {
  return new Array(length).fill('?').join(', ');
}

async function findCategoryById(categoryId) {
  const rows = await query(
    'SELECT id, name FROM categories WHERE id = ? FETCH FIRST 1 ROWS ONLY',
    [categoryId]
  );
  return rows[0] || null;
}

async function findProductById(productId) {
  const rows = await query(
    'SELECT id FROM products WHERE id = ? FETCH FIRST 1 ROWS ONLY',
    [productId]
  );
  return rows[0] || null;
}

async function listProductIdsByCategory(categoryId) {
  const rows = await query(
    'SELECT product_id FROM product_categories WHERE category_id = ? ORDER BY product_id ASC',
    [categoryId]
  );
  return rows.map((row) => row.product_id);
}

async function listCategoryIdsByProduct(productId) {
  const rows = await query(
    `SELECT category_id
     FROM product_categories
     WHERE product_id = ?
     ORDER BY category_id ASC`,
    [productId]
  );
  return rows.map((row) => Number(row.category_id));
}

async function findExistingProductIds(productIds) {
  if (productIds.length === 0) {
    return [];
  }

  const placeholders = buildInClausePlaceholders(productIds.length);
  const rows = await query(
    `SELECT id
     FROM products
     WHERE id IN (${placeholders})`,
    productIds
  );

  return rows.map((row) => row.id);
}

async function replaceCategoryProducts(categoryId, productIds) {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM product_categories WHERE category_id = ?', [categoryId]);

    for (const productId of productIds) {
      await connection.query(
        'INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)',
        [productId, categoryId]
      );
    }

    await connection.commit();
  } catch (error) {
    try {
      await connection.rollback();
    } catch (_rollbackError) {
    }
    throw error;
  } finally {
    await connection.release();
  }
}


module.exports = {
  findCategoryById,
  findProductById,
  listProductIdsByCategory,
  listCategoryIdsByProduct,
  findExistingProductIds,
  replaceCategoryProducts,
};
