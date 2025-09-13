const Joi = require("joi");

exports.otpRequestSchema = Joi.object({
  phone: Joi.string().pattern(new RegExp("^[0-9]{10,15}$")).required(),
});

exports.otpVerifySchema = Joi.object({
  phone: Joi.string().pattern(new RegExp("^[0-9]{10,15}$")).required(),
  firebase_token: Joi.string().required(),
});

exports.registerSchema = Joi.object({
  user_name: Joi.string().required(),
  phone_number: Joi.string().pattern(new RegExp("^[0-9]{10,15}$")).required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  confirm_password: Joi.string().required().valid(Joi.ref("password")),
});

exports.loginSchema = Joi.object({
  identifier: Joi.string().trim().min(3).max(50).required().messages({
    "string.base": "Identifier must be a string",
    "string.empty": "Identifier is required",
    "string.min": "Identifier must be at least 3 characters",
    "string.max": "Identifier must be at most 50 characters",
    "any.required": "Identifier is required",
  }),
  password: Joi.string().trim().min(6).max(128).required().messages({
    "string.base": "Password must be a string",
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
    "string.max": "Password must be at most 128 characters",
    "any.required": "Password is required",
  }),
});

exports.refreshSchema = Joi.object({
  refresh_token: Joi.string().required(),
});

exports.forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

exports.resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().required(),
});
