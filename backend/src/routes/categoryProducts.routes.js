const express = require('express');
const authenticateToken = require('../middleware/auth.middleware');
const categoryProductsController = require('../controllers/categoryProducts.controller');

const router = express.Router();

router.get(
  '/api/categories/:categoryId/products',
  authenticateToken,
  categoryProductsController.getCategoryProducts
);
router.put(
  '/api/categories/:categoryId/products',
  authenticateToken,
  categoryProductsController.replaceCategoryProducts
);
router.get('/api/products/:productId/categories', categoryProductsController.getProductCategories);

module.exports = router;
