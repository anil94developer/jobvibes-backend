const express = require("express");
const router = express.Router();

const validatorResponse = require("../../../utility/joiValidator");

const { authenticate } = require("../../middleware/authMiddleware");
const { feedSchema } = require("../../validationSchema/feedValidationSchema");
const {
  postFeedController,
  getFeedController,
} = require("../../controllers/feedController");

router.get("/", authenticate, getFeedController);

// Route to post a new feed
router.post(
  "/post",
  authenticate,
  validatorResponse(feedSchema),
  postFeedController
);

module.exports = router;
