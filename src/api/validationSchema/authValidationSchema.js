const Joi = require("joi");

exports.otpRequestSchema = Joi.object({
  phone: Joi.string().pattern(new RegExp("^[0-9]{10,15}$")).required(),
});

exports.otpVerifySchema = Joi.object({
  phone: Joi.string().pattern(new RegExp("^[0-9]{10,15}$")).required(),
  firebase_token: Joi.string().required(),
});

exports.tokenRegisterSchema = Joi.object({
  role: Joi.string().valid("candidate", "employer").required().messages({
    "any.required": "Role is required",
    "any.only": "Role must be either 'candidate' or 'employer'",
  }),
  token: Joi.string().required(),
});

exports.registerSchema = Joi.object({
  role: Joi.string().valid("candidate", "employer").required().messages({
    "any.required": "Role is required",
    "any.only": "Role must be either 'candidate' or 'employer'",
  }),
  phone_number: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be between 10 and 15 digits",
      "any.required": "Phone number is required",
    }),
});

exports.loginSchema = Joi.object({
  phone_number: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be between 10 and 15 digits",
      "any.required": "Phone number is required",
    }),
  role: Joi.string().valid("candidate", "employer").required().messages({
    "any.required": "Role is required",
    "any.only": "Role must be either 'candidate' or 'employer'",
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
