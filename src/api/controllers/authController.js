const {
    requestOtpService,
    verifyOtpService,
    registerService,
    loginService,
    logoutService,
    refreshTokenService,
    getMeService,
    revokeSessionService,
    forgotPasswordService,
    resetPasswordService,
    socialLoginService,
    verifyEmailService,
    verifyPhoneService,
    setup2FAService,
    verify2FAService
} = require("../services/authServices");

exports.requestOtpController = async (req, res, next) => {
    try {
        console.log("Request body in requestOtpController:--", req.body);
        const data = await requestOtpService(req);
        res.send(data);
        console.log("Response in requestOtpController:--", data);
    } catch (error) {
        console.log("Error in requestOtpController:--", error);
        next(error);
    }
};

exports.verifyOtpController = async (req, res, next) => {
    try {
        console.log("Request body in verifyOtpController:--", req.body);
        const data = await verifyOtpService(req);
        res.send(data);
        console.log("Response in verifyOtpController:--", data);
    } catch (error) {
        console.log("Error in verifyOtpController:--", error);
        next(error);
    }
};

exports.registerController = async (req, res, next) => {
    try {
        console.log("Request body in registerController:--", req.body);
        const data = await registerService(req);
        res.send(data);
        console.log("Response in registerController:--", data);
    } catch (error) {
        console.log("Error in registerController:--", error);
        next(error);
    }
};

exports.loginController = async (req, res, next) => {
    try {
        console.log("Request body in loginController:--", req.body);
        const data = await loginService(req);
        res.send(data);
        console.log("Response in loginController:--", data);
    } catch (error) {
        console.log("Error in loginController:--", error);
        next(error);
    }
};

exports.logoutController = async (req, res, next) => {
    try {
        console.log("Request body in logoutController:--", req.body);
        const data = await logoutService(req);
        res.send(data);
        console.log("Response in logoutController:--", data);
    } catch (error) {
        console.log("Error in logoutController:--", error);
        next(error);
    }
};

exports.refreshTokenController = async (req, res, next) => {
    try {
        console.log("Request body in refreshTokenController:--", req.body);
        const data = await refreshTokenService(req);
        res.send(data);
        console.log("Response in refreshTokenController:--", data);
    } catch (error) {
        console.log("Error in refreshTokenController:--", error);
        next(error);
    }
};

exports.getMeController = async (req, res, next) => {
    try {
        console.log("Request body in getMeController:--", req.body);
        const data = await getMeService(req);
        res.send(data);
        console.log("Response in getMeController:--", data);
    } catch (error) {
        console.log("Error in getMeController:--", error);
        next(error);
    }
};

exports.revokeSessionController = async (req, res, next) => {
    try {
        console.log("Request body in revokeSessionController:--", req.body);
        const data = await revokeSessionService(req);
        res.send(data);
        console.log("Response in revokeSessionController:--", data);
    } catch (error) {
        console.log("Error in revokeSessionController:--", error);
        next(error);
    }
};

exports.forgotPasswordController = async (req, res, next) => {
    try {
        console.log("Request body in forgotPasswordController:--", req.body);
        const data = await forgotPasswordService(req);
        res.send(data);
        console.log("Response in forgotPasswordController:--", data);
    } catch (error) {
        console.log("Error in forgotPasswordController:--", error);
        next(error);
    }
};

exports.resetPasswordController = async (req, res, next) => {
    try {
        console.log("Request body in resetPasswordController:--", req.body);
        const data = await resetPasswordService(req);
        res.send(data);
        console.log("Response in resetPasswordController:--", data);
    } catch (error) {
        console.log("Error in resetPasswordController:--", error);
        next(error);
    }
};

exports.socialLoginController = async (req, res, next) => {
    try {
        console.log("Request body in socialLoginController:--", req.body);
        const data = await socialLoginService(req);
        res.send(data);
        console.log("Response in socialLoginController:--", data);
    } catch (error) {
        console.log("Error in socialLoginController:--", error);
        next(error);
    }
};

exports.verifyEmailController = async (req, res, next) => {
    try {
        console.log("Request body in verifyEmailController:--", req.body);
        const data = await verifyEmailService(req);
        res.send(data);
        console.log("Response in verifyEmailController:--", data);
    } catch (error) {
        console.log("Error in verifyEmailController:--", error);
        next(error);
    }
};

exports.verifyPhoneController = async (req, res, next) => {
    try {
        console.log("Request body in verifyPhoneController:--", req.body);
        const data = await verifyPhoneService(req);
        res.send(data);
        console.log("Response in verifyPhoneController:--", data);
    } catch (error) {
        console.log("Error in verifyPhoneController:--", error);
        next(error);
    }
};

exports.setup2FAController = async (req, res, next) => {
    try {
        console.log("Request body in setup2FAController:--", req.body);
        const data = await setup2FAService(req);
        res.send(data);
        console.log("Response in setup2FAController:--", data);
    } catch (error) {
        console.log("Error in setup2FAController:--", error);
        next(error);
    }
};

exports.verify2FAController = async (req, res, next) => {
    try {
        console.log("Request body in verify2FAController:--", req.body);
        const data = await verify2FAService(req);
        res.send(data);
        console.log("Response in verify2FAController:--", data);
    } catch (error) {
        console.log("Error in verify2FAController:--", error);
        next(error);
    }
};
