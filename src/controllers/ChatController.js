const Chat = require('../models/Chat.model');
const geminiService = require('../utils/geminiService');

/**
 * Send message to AI assistant
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    // Validation
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid message'
      });
    }

    // Get or create chat history
    let chat = await Chat.findOne({ userId });

    if (!chat) {
      chat = new Chat({
        userId,
        messages: []
      });
    }

    // Add user message
    const userMessage = {
      sender: 'user',
      text: message.trim(),
      timestamp: new Date()
    };

    chat.messages.push(userMessage);

    // Get AI response
    let aiResponse = 'I apologize, but I am unable to process your request at the moment.';
    
    try {
      // Get last 5 messages for context (excluding the one we just added)
      const chatHistory = chat.messages.slice(0, -1);
      aiResponse = await geminiService.chatWithAI(message.trim(), chatHistory);
    } catch (aiError) {
      console.error('Gemini AI error:', aiError);
      aiResponse = 'I apologize, but I encountered an error processing your request. Please try again later.';
    }

    // Add AI response
    const aiMessage = {
      sender: 'ai',
      text: aiResponse,
      timestamp: new Date()
    };

    chat.messages.push(aiMessage);

    // Limit chat history to last 50 messages
    if (chat.messages.length > 50) {
      chat.messages = chat.messages.slice(-50);
    }

    await chat.save();

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        userMessage,
        aiMessage
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get chat history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const chat = await Chat.findOne({ userId });

    if (!chat || !chat.messages || chat.messages.length === 0) {
      return res.json({
        success: true,
        message: 'No chat history found',
        data: {
          messages: []
        }
      });
    }

    res.json({
      success: true,
      message: 'Chat history retrieved successfully',
      data: {
        messages: chat.messages,
        totalMessages: chat.messages.length
      }
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Clear chat history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const clearChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    const chat = await Chat.findOne({ userId });

    if (!chat) {
      return res.json({
        success: true,
        message: 'No chat history to clear'
      });
    }

    chat.messages = [];
    await chat.save();

    res.json({
      success: true,
      message: 'Chat history cleared successfully'
    });
  } catch (error) {
    console.error('Clear chat history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  clearChatHistory
};

