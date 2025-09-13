const Joi = require('joi');

exports.createUserSchema = Joi.object({
    user_name: Joi.string().required(),
    phone_number: Joi.string().pattern(new RegExp('^[0-9]{10}$')).required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    confirm_password: Joi.string().required().valid(Joi.ref('password'))
});

exports.addUserSchema = Joi.object({
    user_name: Joi.string().required(),
    phone_number: Joi.string().pattern(new RegExp('^[0-9]{10}$')).required(),
    email: Joi.string().email().required()
});

exports.editUserSchema = Joi.object({
    user_name: Joi.string().required(),
    userId: Joi.string().required(),
    phone_number: Joi.string().pattern(new RegExp('^[0-9]{10}$')).required(),
    email: Joi.string().email().required()
});

exports.signInUserSchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
});

exports.editUserSchema = Joi.object({
    user_name: Joi.string().required(),
    phone_number: Joi.string().required(),
    email: Joi.string().required(),
});

// Jobs
exports.createJobSchema = Joi.object({
    title: Joi.string().required(),
    company_id: Joi.string().required(),
    dept: Joi.string().optional(),
    location_type: Joi.string().valid('remote', 'onsite', 'hybrid').optional(),
    salary_min: Joi.number().optional(),
    salary_max: Joi.number().optional(),
    skills: Joi.array().items(Joi.string()).default([]),
    description: Joi.string().optional(),
    source: Joi.string().valid('private', 'gov').optional(),
    deadline_at: Joi.date().optional(),
    status: Joi.string().valid('open', 'paused', 'closed').optional()
});

// Matches
exports.createMatchSchema = Joi.object({
    candidate_id: Joi.string().required(),
    job_id: Joi.string().required(),
    status: Joi.string().valid('matched', 'chatting', 'scheduled', 'hired', 'rejected').optional()
});

// Messages
exports.sendMessageSchema = Joi.object({
    match_id: Joi.string().required(),
    sender_id: Joi.string().required(),
    text: Joi.string().allow('', null),
    attachment_url: Joi.string().uri().optional()
});