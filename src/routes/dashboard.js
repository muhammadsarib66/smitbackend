const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');
const { authenticateToken } = require('../middleware/middleware');

// Get dashboard statistics
router.get('/stats', authenticateToken, DashboardController.getDashboardStats);

module.exports = router;

