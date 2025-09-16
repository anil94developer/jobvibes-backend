const express = require("express");
const router = express.Router();

const validatorResponse = require("../../../utility/joiValidator");

const { authenticate } = require("../../middleware/authMiddleware");
const {
  getNotificationsController,
} = require("../../controllers/notificationsController");

router.get("/", authenticate, getNotificationsController);

module.exports = router;
