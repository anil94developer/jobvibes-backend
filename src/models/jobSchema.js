const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const jobSchema = new Schema({
    title: { type: String, required: true },
    company_id: { type: String, required: true },
    dept: { type: String },
    location_type: { type: String, enum: ['remote', 'onsite', 'hybrid'], default: 'onsite' },
    salary_min: { type: Number },
    salary_max: { type: Number },
    skills: { type: [String], index: true },
    description: { type: String },
    source: { type: String, enum: ['private', 'gov'], default: 'private', index: true },
    deadline_at: { type: Date },
    status: { type: String, enum: ['open', 'paused', 'closed'], default: 'open', index: true }
}, { timestamps: true });

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;


