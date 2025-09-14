const express = require("express");
const router = express.Router();

const validatorResponse = require("../../../utility/joiValidator");
const {
  step1Controller,
  step2Controller,
  step3Controller,
} = require("../../controllers/userController.js");
const { authenticate } = require("../../middleware/authMiddleware");
const {
  step1Schema,
} = require("../../validationSchema/userValidationSchema.js");

router.post(
  "/step-1",
  authenticate,
  validatorResponse(step1Schema),
  step1Controller
);
router.post("/step-2", authenticate, step2Controller);
router.post("/step-3", authenticate, step3Controller);

module.exports = router;
