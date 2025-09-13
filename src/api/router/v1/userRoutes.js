const express = require("express");
const router = express.Router();

const {
  step1Controller,
  step2Controller,
} = require("../../controllers/userController.js");
const { authenticate } = require("../../middleware/authMiddleware");

router.post("/step-1", authenticate, step1Controller);

router.post("/step-2", authenticate, step2Controller);

module.exports = router;
