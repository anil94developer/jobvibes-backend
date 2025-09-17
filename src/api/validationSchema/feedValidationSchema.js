const Joi = require("joi");

exports.feedSchema = Joi.object({
  content: Joi.string().required(),
  // media: Joi.array().items(Joi.string()).min(1).required(),
});

exports.postReactionSchema = Joi.object({
  ratingValue: Joi.number().min(1).max(5).required(),
});
