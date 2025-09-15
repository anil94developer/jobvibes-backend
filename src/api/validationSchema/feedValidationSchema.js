const Joi = require("joi");

exports.feedSchema = Joi.object({
  content: Joi.string().required(),
  media: Joi.array().items(Joi.string()).default([]),
});
