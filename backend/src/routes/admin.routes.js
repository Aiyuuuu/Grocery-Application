const express = require('express');
const authenticateToken = require('../middleware/auth.middleware');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

router.post('/api/admin/query', authenticateToken, adminController.runQuery);
router.get('/api/admin/schema', authenticateToken, adminController.getSchema);

module.exports = router;
