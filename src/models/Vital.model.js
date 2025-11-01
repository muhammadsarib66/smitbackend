const mongoose = require('mongoose');

const VitalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  bp: {
    type: String,
    default: null,
    trim: true
  },
  sugar: {
    type: Number,
    default: null
  },
  weight: {
    type: Number,
    default: null
  },
  pulse: {
    type: Number,
    default: null
  },
  temperature: {
    type: Number,
    default: null
  },
  notes: {
    type: String,
    default: null,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
VitalSchema.index({ userId: 1, date: -1 });

const Vital = mongoose.model('Vital', VitalSchema);

module.exports = Vital;

