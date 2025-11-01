const mongoose = require('mongoose');

const PasswordResetOTPSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  },
  {
    versionKey: false
  }
);

// Auto-expire OTP documents after 10 minutes
PasswordResetOTPSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

module.exports = mongoose.model('PasswordResetOTP', PasswordResetOTPSchema);


