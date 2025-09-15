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
} = require("../../controllers/feedController");

router.get("/", authenticate, getFeedController);

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

module.exports = router;
