const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
    enum: ['user', 'ai']
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const ChatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  messages: {
    type: [MessageSchema],
    default: []
  }
}, {
  timestamps: true
});

// Index for efficient queries
ChatSchema.index({ userId: 1 });

const Chat = mongoose.model('Chat', ChatSchema);

module.exports = Chat;

