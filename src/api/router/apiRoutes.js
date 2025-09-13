const express = require("express");
const router = express.Router();

//schemaValidator
const validatorResponse = require("../../utility/joiValidator");

//schemas
const {  createJobSchema, createMatchSchema, sendMessageSchema } = require("../validationSchema/apiValidationSchema");


//controller
const {  createJobController, getJobController, searchJobsController, createMatchController, listMatchesByCandidateController, sendMessageController, listMessagesByMatchController } = require("../controllers/apiController");


// Jobs
router.post('/jobs', validatorResponse(createJobSchema), createJobController);
router.get('/jobs/:id', getJobController);
router.get('/jobs', searchJobsController);

// Matches
router.post('/matches', validatorResponse(createMatchSchema), createMatchController);
router.get('/matches/candidate/:id', listMatchesByCandidateController);

// Messages
router.post('/messages', validatorResponse(sendMessageSchema), sendMessageController);
router.get('/messages/match/:id', listMessagesByMatchController);


module.exports = router;    