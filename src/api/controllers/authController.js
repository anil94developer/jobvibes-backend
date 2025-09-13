const { sendResponse } = require("../../utility/responseFormat");
const {
  requestOtpService,
  verifyOtpService,
  registerService,
  loginService,
  logoutService,
  refreshTokenService,
  getMeService,
  forgotPasswordService,
  resetPasswordService,
  verifyEmailService,
  verifyPhoneService,
  updateProfile,
  tokenRegisterService,
} = require("../services/authServices");

// --- Helper to handle responses ---

exports.requestOtpController = async (req, res, next) => {
  try {
    console.log("Request body in requestOtpController:--", req.body);
    const data = await requestOtpService(req.body.phone);
    sendResponse(res, data);
    console.log("Response in requestOtpController:--", data);
  } catch (error) {
    console.log("Error in requestOtpController:--", error);
    next(error);
  }
};

exports.verifyOtpController = async (req, res, next) => {
  try {
    console.log("Request body in verifyOtpController:--", req.body);
    const { phone, firebase_token } = req.body;
    const data = await verifyOtpService(
      phone,
      firebase_token,
      req.headers["user-agent"],
      req.ip
    );
    sendResponse(res, data);
    console.log("Response in verifyOtpController:--", data);
  } catch (error) {
    console.log("Error in verifyOtpController:--", error);
    next(error);
  }
};

exports.tokenRegisterController = async (req, res, next) => {
  try {
    console.log("Request body in tokenRegisterController:--", req.body);
    const data = await tokenRegisterService(
      req.body,
      req.headers["user-agent"],
      req.ip
    );
    sendResponse(res, data);
    console.log("Response in tokenRegisterController:--", data);
  } catch (error) {
    console.log("Error in tokenRegisterController:--", error);
    next(error);
  }
};

exports.registerController = async (req, res, next) => {
  try {
    console.log("Request body in registerController:--", req.body);
    const data = await registerService(
      req.body,
      req.headers["user-agent"],
      req.ip
    );
    sendResponse(res, data);
    console.log("Response in registerController:--", data);
  } catch (error) {
    console.log("Error in registerController:--", error);
    next(error);
  }
};

exports.loginController = async (req, res, next) => {
  try {
    console.log("Request body in loginController:--", req.body);
    const data = await loginService(
      req.body,
      req.headers["user-agent"],
      req.ip
    );
    sendResponse(res, data);
    console.log("Response in loginController:--", data);
  } catch (error) {
    console.log("Error in loginController:--", error);
    next(error);
  }
};

exports.logoutController = async (req, res, next) => {
  try {
    console.log("Request body in logoutController:--", req.body);
    const data = await logoutService(req.user);
    sendResponse(res, data);
    console.log("Response in logoutController:--", data);
  } catch (error) {
    console.log("Error in logoutController:--", error);
    next(error);
  }
};

exports.refreshTokenController = async (req, res, next) => {
  try {
    console.log("Request body in refreshTokenController:--", req.body);
    const data = await refreshTokenService(req.body);
    sendResponse(res, data);
    console.log("Response in refreshTokenController:--", data);
  } catch (error) {
    console.log("Error in refreshTokenController:--", error);
    next(error);
  }
};

exports.getMeController = async (req, res, next) => {
  try {
    console.log("Request body in getMeController:--", req.body);
    const data = await getMeService(req.user.sub);
    sendResponse(res, data);
    console.log("Response in getMeController:--", data);
  } catch (error) {
    console.log("Error in getMeController:--", error);
    next(error);
  }
};

exports.forgotPasswordController = async (req, res, next) => {
  try {
    console.log("Request body in forgotPasswordController:--", req.body);
    const data = await forgotPasswordService(req.body.email);
    sendResponse(res, data);
    console.log("Response in forgotPasswordController:--", data);
  } catch (error) {
    console.log("Error in forgotPasswordController:--", error);
    next(error);
  }
};

exports.resetPasswordController = async (req, res, next) => {
  try {
    console.log("Request body in resetPasswordController:--", req.body);
    const { token, password } = req.body;
    const data = await resetPasswordService(token, password);
    sendResponse(res, data);
    console.log("Response in resetPasswordController:--", data);
  } catch (error) {
    console.log("Error in resetPasswordController:--", error);
    next(error);
  }
};

exports.verifyEmailController = async (req, res, next) => {
  try {
    console.log("Request body in verifyEmailController:--", req.body);
    const data = await verifyEmailService();
    sendResponse(res, data);
    console.log("Response in verifyEmailController:--", data);
  } catch (error) {
    console.log("Error in verifyEmailController:--", error);
    next(error);
  }
};

exports.verifyPhoneController = async (req, res, next) => {
  try {
    console.log("Request body in verifyPhoneController:--", req.body);
    const data = await verifyPhoneService();
    sendResponse(res, data);
    console.log("Response in verifyPhoneController:--", data);
  } catch (error) {
    console.log("Error in verifyPhoneController:--", error);
    next(error);
  }
};

exports.updateProfileController = async (req, res, next) => {
  try {
    console.log("Request body in updateProfileController:--", req.body);
    const data = await updateProfile(req.params.id, req.body);
    sendResponse(res, data);
    console.log("Response in updateProfileController:--", data);
  } catch (error) {
    console.log("Error in updateProfileController:--", error);
    next(error);
  }
};
