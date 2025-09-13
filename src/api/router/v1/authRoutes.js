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
    resetPasswordSchema
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
    verify2FAController
} = require("../../controllers/authController");

const { authenticate } = require("../../middleware/authMiddleware");

// OTP
router.post('/otp', validatorResponse(otpRequestSchema), requestOtpController);
router.post('/verify', validatorResponse(otpVerifySchema), verifyOtpController);

// Core auth
router.post('/register', validatorResponse(registerSchema), registerController);
router.post('/login', validatorResponse(loginSchema), loginController);
router.post('/logout', authenticate, logoutController);
router.post('/refresh', validatorResponse(refreshSchema), refreshTokenController);

// Sessions
router.delete('/sessions/:id', authenticate, revokeSessionController);

// Password flow
router.post('/password/forgot', validatorResponse(forgotPasswordSchema), forgotPasswordController);
router.post('/password/reset', validatorResponse(resetPasswordSchema), resetPasswordController);

// Social / Federated
router.post('/social/:provider', socialLoginController);

// Identity & Security
router.get('/me', authenticate, getMeController);
router.post('/verify-email', verifyEmailController);
router.post('/verify-phone', verifyPhoneController);
router.post('/2fa/setup', authenticate, setup2FAController);
router.post('/2fa/verify', authenticate, verify2FAController);

module.exports = router;


