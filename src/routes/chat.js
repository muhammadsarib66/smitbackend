const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/ChatController');
const { authenticateToken } = require('../middleware/middleware');

// Chat routes
router.post('/message', authenticateToken, ChatController.sendMessage);
router.get('/history', authenticateToken, ChatController.getChatHistory);
router.delete('/history', authenticateToken, ChatController.clearChatHistory);

module.exports = router;

