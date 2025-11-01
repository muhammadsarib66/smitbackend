const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportType: {
    type: String,
    required: true,
    enum: ['CBC', 'X-Ray', 'Ultrasound', 'Blood Test', 'Other'],
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  fileUrl: {
    type: String,
    default: null
  },
  manualData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  aiSummary: {
    type: String,
    default: null
  },
  abnormalities: {
    type: [String],
    default: []
  },
  doctorQuestions: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
ReportSchema.index({ userId: 1, date: -1 });
ReportSchema.index({ userId: 1, reportType: 1 });

const Report = mongoose.model('Report', ReportSchema);

module.exports = Report;

