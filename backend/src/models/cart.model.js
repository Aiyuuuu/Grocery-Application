const { query } = require('../../db');

async function listCartItems(userId) {
  return query(
    `SELECT ci.product_id AS id, p.name, p.price, p.image,
            p.sale_type, p.unit, p.unit_weight, p.description, ci.quantity
     FROM cart_items ci
     JOIN products p ON ci.product_id = p.id
     WHERE ci.user_id = ?
     ORDER BY ci.created_at DESC`,
    [userId]
  );
}

async function findProductForCart(productId) {
  const rows = await query(
    `SELECT id, name, price, is_active
     FROM products
     WHERE id = ?
     FETCH FIRST 1 ROWS ONLY`,
    [productId]
  );
  return rows[0] || null;
}

async function findCartItem(userId, productId) {
  const rows = await query(
    'SELECT user_id, product_id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? FETCH FIRST 1 ROWS ONLY',
    [userId, productId]
  );
  return rows[0] || null;
}

async function updateCartItemQuantity(userId, productId, quantity) {
  return query(
    'UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?',
    [quantity, userId, productId]
  );
}

async function insertCartItem(userId, productId, quantity) {
  return query(
    'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
    [userId, productId, quantity]
  );
}

async function deleteCartItem(userId, productId) {
  return query('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', [userId, productId]);
}

async function clearCartByUser(userId) {
  return query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
}

module.exports = {
  listCartItems,
  findProductForCart,
  findCartItem,
  updateCartItemQuantity,
  insertCartItem,
  deleteCartItem,
  clearCartByUser,
};
