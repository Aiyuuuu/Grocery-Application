const express = require('express');
const authenticateToken = require('../middleware/auth.middleware');
const cartController = require('../controllers/cart.controller');

const router = express.Router();

// All cart routes require authentication.
// Note: :id in PUT/DELETE routes represents product_id, not cart_items.id.
router.get('/api/cart', authenticateToken, cartController.getCart);
router.post('/api/cart', authenticateToken, cartController.addToCart);
router.put('/api/cart/:id', authenticateToken, cartController.updateCartItem);
router.delete('/api/cart/:id', authenticateToken, cartController.removeFromCart);
router.delete('/api/cart/product/:productId', authenticateToken, cartController.removeByProductId);
router.post('/api/cart/clear', authenticateToken, cartController.clearCart);

module.exports = router;
