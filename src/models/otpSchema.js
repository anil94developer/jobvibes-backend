const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const otpSchema = new Schema({
    phone: { type: String, required: true },
    code: { type: String, required: true },
    expires_at: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Otp', otpSchema);


