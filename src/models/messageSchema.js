const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    match_id: { type: String, required: true, index: true },
    sender_id: { type: String, required: true },
    text: { type: String },
    attachment_url: { type: String }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;


