const express = require("express");
const router = express.Router();

const validatorResponse = require("../../../utility/joiValidator");
const {
  otpRequestSchema,
  otpVerifySchema,
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  tokenRegisterSchema,
} = require("../../validationSchema/authValidationSchema");

const {
  requestOtpController,
  verifyOtpController,
  registerController,
  loginController,
  logoutController,
  refreshTokenController,
  getMeController,
  revokeSessionController,
  forgotPasswordController,
  resetPasswordController,
  socialLoginController,
  verifyEmailController,
  verifyPhoneController,
  setup2FAController,
  verify2FAController,
  updateProfileController,
  tokenRegisterController,
} = require("../../controllers/authController");

const { authenticate } = require("../../middleware/authMiddleware");

// OTP
router.post("/otp", validatorResponse(otpRequestSchema), requestOtpController);
router.post("/verify", validatorResponse(otpVerifySchema), verifyOtpController);

// Core auth

router.post(
  "/token-register",
  validatorResponse(tokenRegisterSchema),
  tokenRegisterController
);
router.post("/register", validatorResponse(registerSchema), registerController);
router.post("/login", validatorResponse(loginSchema), loginController);
router.post("/logout", authenticate, logoutController);
router.post(
  "/refresh",
  validatorResponse(refreshSchema),
  refreshTokenController
);

// Password flow
router.post(
  "/password/forgot",
  validatorResponse(forgotPasswordSchema),
  forgotPasswordController
);
router.post(
  "/password/reset",
  validatorResponse(resetPasswordSchema),
  resetPasswordController
);

// Identity & Security
router.get("/me", authenticate, getMeController);

router.post("/update/:id", updateProfileController);
module.exports = router;
