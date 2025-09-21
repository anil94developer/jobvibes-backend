const Joi = require("joi");

exports.feedSchema = Joi.object({
  content: Joi.string().allow(""),
  media: Joi.array().items(Joi.string()),

  job_title: Joi.array().items(Joi.string()),
  work_place_name: Joi.array().items(Joi.string()),
  job_type: Joi.array().items(Joi.string()),
  cities: Joi.array().items(Joi.string()),
  notice_period: Joi.number().min(0),
  is_immediate_joiner: Joi.boolean(),
})
  // Require either content or media
  .or("content", "media")
  // Require at least one of job_title, work_place_name, job_type, cities
  .or("job_title", "work_place_name", "job_type", "cities");

exports.postReactionSchema = Joi.object({
  ratingValue: Joi.number().min(1).max(5).required(),
});
