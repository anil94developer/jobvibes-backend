const express = require("express");
const router = express.Router();

//schemaValidator
const validatorResponse = require("../../utility/joiValidator");

//schemas
const {
  createJobSchema,
  createMatchSchema,
  sendMessageSchema,
} = require("../validationSchema/apiValidationSchema");

//controller
const {
  createJobController,
  getJobController,
  searchJobsController,
  createMatchController,
  listMatchesByCandidateController,
  sendMessageController,
  listMessagesByMatchController,
  getStatesController,
  getCitiesByStateController,
  getJobTitleController,
} = require("../controllers/apiController");

// States
router.get("/states", getStatesController);

// Cities
router.get("/states/:stateId/cities", getCitiesByStateController);

// Job title
router.get("/job-titles", getJobTitleController);

module.exports = router;
