const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    phone: { type: String },
    code: { type: String }, // optional if using Firebase token
    firebase_token: { type: String }, // store Firebase token
    expires_at: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Otp", otpSchema);
