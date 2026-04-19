const { query } = require('../../db');

function formatCartItem(item) {
  return {
    ...item,
    price: item.price !== null ? Number(item.price) : null,
    quantity: item.quantity !== null ? Number(item.quantity) : 0,
    unitWeight: item.unitWeight !== null ? Number(item.unitWeight) : null,
  };
}

exports.getCart = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const items = await query(
      `SELECT ci.product_id as id, p.name, p.price, p.image, 
              p.sale_type as saleType, p.unit, p.unit_weight as unitWeight, p.description, ci.quantity
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?
       ORDER BY ci.created_at DESC`,
      [userId]
    );

    res.json({ items: items.map(formatCartItem) });
  } catch (error) {
    next(error);
  }
};

exports.addToCart = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const { id, quantity } = req.body;
    const parsedQuantity = Number(quantity);

    // Validate
    if (!id || !Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: 'Product ID and valid quantity are required' });
    }

    // Check if product exists
    const products = await query(
      'SELECT id FROM products WHERE id = ?',
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Upsert (insert or update)
    await query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = ?`,
      [userId, id, parsedQuantity, parsedQuantity]
    );

    // Fetch updated item
    const updatedItems = await query(
      `SELECT ci.product_id as id, p.name, p.price, p.image,
              p.sale_type as saleType, p.unit, p.unit_weight as unitWeight, p.description, ci.quantity
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ? AND ci.product_id = ?`,
      [userId, id]
    );

    if (updatedItems.length === 0) {
      return res.status(500).json({ message: 'Failed to add item to cart' });
    }

    res.status(201).json(formatCartItem(updatedItems[0]));
  } catch (error) {
    next(error);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const parsedQuantity = Number(quantity);

    if (!Number.isFinite(parsedQuantity) || parsedQuantity < 0) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    // Check ownership
    const existing = await query(
      'SELECT id FROM cart_items WHERE product_id = ? AND user_id = ?',
      [productId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (parsedQuantity === 0) {
      // Delete if quantity is 0
      await query(
        'DELETE FROM cart_items WHERE product_id = ? AND user_id = ?',
        [productId, userId]
      );
      return res.json({ message: 'Item removed from cart' });
    }

    await query(
      'UPDATE cart_items SET quantity = ? WHERE product_id = ? AND user_id = ?',
      [parsedQuantity, productId, userId]
    );

    const updatedItems = await query(
      `SELECT ci.product_id as id, p.name, p.price, p.image,
              p.sale_type as saleType, p.unit, p.unit_weight as unitWeight, p.description, ci.quantity
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ? AND ci.product_id = ?`,
      [userId, productId]
    );

    if (updatedItems.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json(formatCartItem(updatedItems[0]));
  } catch (error) {
    next(error);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const { id: productId } = req.params;

    const result = await query(
      'DELETE FROM cart_items WHERE product_id = ? AND user_id = ?',
      [productId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    next(error);
  }
};

exports.removeByProductId = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const { productId } = req.params;

    const result = await query(
      'DELETE FROM cart_items WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    res.json({ message: 'Product removed from cart' });
  } catch (error) {
    next(error);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    const userId = req.auth.userId;

    await query(
      'DELETE FROM cart_items WHERE user_id = ?',
      [userId]
    );

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    next(error);
  }
};
