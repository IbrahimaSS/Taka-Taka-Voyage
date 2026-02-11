const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    telephone: {
      type: String,
      required: true,
      index: true
    },
    codeHash: {
      type: String,
      required: true,
    },
    expireA: {
      type: Date,
      required: true,
    },
    lastSentAt: {
      type: Date,
      default: Date.now
    },
    attempts: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// 1 OTP actif par téléphone
otpSchema.index({ telephone: 1 }, { unique: true });

module.exports = mongoose.model("Otp", otpSchema);