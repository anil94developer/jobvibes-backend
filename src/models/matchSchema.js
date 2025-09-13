const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const matchSchema = new Schema({
    candidate_id: { type: String, required: true, index: true },
    job_id: { type: String, required: true, index: true },
    status: { type: String, enum: ['matched', 'chatting', 'scheduled', 'hired', 'rejected'], default: 'matched' }
}, { timestamps: true });

const Match = mongoose.model('Match', matchSchema);
module.exports = Match;


