const express = require('express');
const {
	getProducts,
	getActiveProducts,
	getProductById,
	addProduct,
	deleteProduct,
} = require('../controllers/products.controller');

const router = express.Router();

router.get('/api/products', getProducts);
router.get('/api/products/active', getActiveProducts);
router.get('/api/products/:id', getProductById);
router.post('/api/products', addProduct);
router.delete('/api/products/:id', deleteProduct);

module.exports = router;
