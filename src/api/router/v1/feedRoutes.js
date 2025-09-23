const express = require("express");
const router = express.Router();

const validatorResponse = require("../../../utility/joiValidator");

const { authenticate } = require("../../middleware/authMiddleware");
const {
  feedSchema,
  postReactionSchema,
} = require("../../validationSchema/feedValidationSchema");
const {
  postFeedController,
  getFeedController,
  postReactionController,
  getReactedController,
  getExploreFeedController,
} = require("../../controllers/feedController");

// Get all post
router.post("/", authenticate, getFeedController);

// Explore Feeds
router.get("/explore", authenticate, getExploreFeedController);

// Route to post a new feed
router.post(
  "/post",
  authenticate,
  validatorResponse(feedSchema),
  postFeedController
);

router.post(
  "/:feedId/reactions",
  authenticate,
  validatorResponse(postReactionSchema),
  postReactionController
);

router.get("/reacted-feeds", authenticate, getReactedController);

// // Jobs
// router.post("/jobs", validatorResponse(createJobSchema), createJobController);
// router.get("/jobs/:id", getJobController);
// router.get("/jobs", searchJobsController);

// // Matches
// router.post(
//   "/matches",
//   validatorResponse(createMatchSchema),
//   createMatchController
// );
// router.get("/matches/candidate/:id", listMatchesByCandidateController);

// // Messages
// router.post(
//   "/messages",
//   validatorResponse(sendMessageSchema),
//   sendMessageController
// );
// router.get("/messages/match/:id", listMessagesByMatchController);

module.exports = router;
