const cartModel = require('../models/cart.model');

function formatCartItem(item) {
  return {
    ...item,
    price: item.price !== null ? Number(item.price) : null,
    quantity: item.quantity !== null ? Number(item.quantity) : 0,
    unitWeight: item.unit_weight !== null ? Number(item.unit_weight) : null,
  };
}

exports.getCart = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const items = await cartModel.listCartItems(userId);

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

    if (!id || !Number.isFinite(parsedQuantity) || !Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ message: 'Product ID and valid quantity are required' });
    }

    const product = await cartModel.findProductForCart(id);

    if (!product || product.is_active !== 'true') {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updateResult = await cartModel.updateCartItemQuantity(userId, id, parsedQuantity);

    if (!updateResult.affectedRows) {
      await cartModel.insertCartItem(userId, id, parsedQuantity);
    }

    const updatedItems = await cartModel.listCartItems(userId);
    const targetItem = updatedItems.find((item) => item.id === id);

    if (!targetItem) {
      return res.status(500).json({ message: 'Failed to add item to cart' });
    }

    res.status(201).json(formatCartItem(targetItem));
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

    if (!Number.isFinite(parsedQuantity) || !Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    const existing = await cartModel.findCartItem(userId, productId);

    if (!existing) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (parsedQuantity === 0) {
      await cartModel.deleteCartItem(userId, productId);
      return res.json({ message: 'Item removed from cart' });
    }

    await cartModel.updateCartItemQuantity(userId, productId, parsedQuantity);

    const updatedItems = await cartModel.listCartItems(userId);
    const targetItem = updatedItems.find((item) => item.id === productId);

    if (!targetItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json(formatCartItem(targetItem));
  } catch (error) {
    next(error);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const userId = req.auth.userId;
    const { id: productId } = req.params;

    const result = await cartModel.deleteCartItem(userId, productId);

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

    const result = await cartModel.deleteCartItem(userId, productId);

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

    await cartModel.clearCartByUser(userId);

    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    next(error);
  }
};
