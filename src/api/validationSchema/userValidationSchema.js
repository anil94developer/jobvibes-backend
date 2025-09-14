const Joi = require("joi");

exports.step1Schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  gender: Joi.string()
    .valid("male", "female", "other", "prefer_not_to_say")
    .required(),
  role: Joi.string().valid("candidate", "employer").required(),
});
