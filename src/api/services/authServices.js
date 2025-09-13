const User = require("../../models/userSchema");
const Session = require("../../models/sessionSchema");
const Otp = require("../../models/otpSchema");
const admin = require("../../utility/firebase");
const {
  hashPassword,
  comparePassword,
  issueTokens,
  verifyToken,
  generateOtp,
} = require("../../utility/authUtils");

// ✅ Destructure safe fields from user
function destructureUser(user) {
  if (!user) return {};
  const {
    _id,
    user_name,
    phone_number,
    email,
    role,
    skills,
    qualifications,
    intro_video_url,
    resume_url,
    gender,
  } = user;
  return {
    id: _id,
    user_name,
    phone_number,
    email,
    role,
    skills,
    qualifications,
    intro_video_url,
    resume_url,
    gender,
  };
}

// --- OTP Services ---
exports.requestOtpService = async (phone) => {
  try {
    const firebaseToken = await admin.auth().createCustomToken(phone);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins expiry

    await Otp.create({
      phone,
      firebase_token: firebaseToken,
      expires_at: expiresAt,
    });

    return {
      status: true,
      statusCode: 200,
      message: "OTP token generated",
      data: { token: firebaseToken, ttl: 300 },
    };
  } catch (error) {
    return { status: false, statusCode: 500, message: error.message, data: {} };
  }
};

exports.verifyOtpService = async (
  phone,
  firebase_token,
  role,
  gender,
  userAgent = "",
  ip = ""
) => {
  try {
    const otpRecord = await Otp.findOne({ phone, firebase_token }).sort({
      createdAt: -1,
    });

    if (!otpRecord || otpRecord.expires_at < new Date()) {
      return {
        status: false,
        statusCode: 400,
        message: "Invalid or expired OTP token",
        data: {},
      };
    }

    let user = await User.findOne({ phone_number: phone });
    if (!user) {
      const password = await hashPassword("otp_only");
      user = await User.create({
        user_name: phone,
        phone_number: phone,
        email: `${phone}@placeholder.local`,
        password,
        confirm_password: password,
        role: role || "candidate",
        gender: gender || "prefer_not_to_say",
      });
    }

    const session = await Session.create({
      user_id: user._id,
      user_agent: userAgent,
      ip,
    });

    const tokens = issueTokens(user._id.toString(), session._id.toString());

    await Otp.deleteOne({ _id: otpRecord._id });

    return {
      status: true,
      statusCode: 200,
      message: "OTP verified",
      data: { ...destructureUser(user), tokens },
    };
  } catch (error) {
    return { status: false, statusCode: 500, message: error.message, data: {} };
  }
};

// --- Registration Service ---
exports.registerService = async (body, userAgent = "", ip = "") => {
  try {
    const {
      phone_number,
      user_name,
      email,
      password,
      role,
      gender,
      skills,
      qualifications,
      intro_video_url,
      resume_url,
    } = body;

    if (await User.findOne({ phone_number }))
      return {
        status: false,
        statusCode: 400,
        message: "Phone already registered",
        data: {},
      };
    if (await User.findOne({ user_name }))
      return {
        status: false,
        statusCode: 400,
        message: "User name already taken",
        data: {},
      };
    if (email && (await User.findOne({ email })))
      return {
        status: false,
        statusCode: 400,
        message: "Email already registered",
        data: {},
      };

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      user_name,
      phone_number,
      email,
      password: hashedPassword,
      confirm_password: hashedPassword,
      role: role || "candidate",
      gender: gender || "prefer_not_to_say",
      skills: skills || [],
      qualifications: qualifications || [],
      intro_video_url: intro_video_url || "",
      resume_url: resume_url || "",
    });

    const session = await Session.create({
      user_id: user._id,
      user_agent: userAgent,
      ip,
    });
    const tokens = issueTokens(user._id.toString(), session._id.toString());

    return {
      status: true,
      statusCode: 201,
      message: "Registered",
      data: { ...destructureUser(user), tokens },
    };
  } catch (e) {
    return { status: false, statusCode: 500, message: e.message, data: {} };
  }
};

// --- Login Service ---
exports.loginService = async (body, userAgent = "", ip = "") => {
  try {
    const { identifier, password } = body;
    const user = await User.findOne({
      $or: [{ phone_number: identifier }, { user_name: identifier }],
    });

    if (!user || !(await comparePassword(password, user.password)))
      return {
        status: false,
        statusCode: 401,
        message: "Invalid credentials",
        data: {},
      };

    const session = await Session.create({
      user_id: user._id,
      user_agent: userAgent,
      ip,
    });
    const tokens = issueTokens(user._id.toString(), session._id.toString());

    return {
      status: true,
      statusCode: 200,
      message: "Logged in",
      data: { ...destructureUser(user), tokens },
    };
  } catch (e) {
    return { status: false, statusCode: 500, message: e.message, data: {} };
  }
};

// --- Logout Service ---
exports.logoutService = async (user) => {
  try {
    const sessionId = user?.sid;
    if (sessionId)
      await Session.findByIdAndUpdate(sessionId, {
        revoked: true,
        revoked_at: new Date(),
      });

    return { status: true, statusCode: 200, message: "Logged out", data: {} };
  } catch (e) {
    return { status: false, statusCode: 500, message: e.message, data: {} };
  }
};

// --- Refresh Token Service ---
exports.refreshTokenService = async (body) => {
  try {
    const { refresh_token } = body;
    const payload = verifyToken(refresh_token, "refresh");
    if (!payload)
      return {
        status: false,
        statusCode: 401,
        message: "Invalid token",
        data: {},
      };

    const session = await Session.findById(payload.sid);
    if (!session || session.revoked)
      return {
        status: false,
        statusCode: 401,
        message: "Invalid session",
        data: {},
      };

    const tokens = issueTokens(payload.sub, payload.sid);
    return {
      status: true,
      statusCode: 200,
      message: "Refreshed",
      data: { tokens },
    };
  } catch (e) {
    return { status: false, statusCode: 500, message: e.message, data: {} };
  }
};

// --- Get Me Service ---
exports.getMeService = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user)
      return { status: false, statusCode: 404, message: "Not found", data: {} };

    return {
      status: true,
      statusCode: 200,
      message: "Me",
      data: destructureUser(user),
    };
  } catch (e) {
    return { status: false, statusCode: 500, message: e.message, data: {} };
  }
};

// --- Revoke Session Service ---
exports.revokeSessionService = async (userId, sessionId) => {
  try {
    await Session.findOneAndUpdate(
      { _id: sessionId, user_id: userId },
      { revoked: true, revoked_at: new Date() }
    );
    return {
      status: true,
      statusCode: 200,
      message: "Session revoked",
      data: {},
    };
  } catch (e) {
    return { status: false, statusCode: 500, message: e.message, data: {} };
  }
};

// --- Forgot Password Service ---
exports.forgotPasswordService = async (email) => {
  try {
    const user = await User.findOne({ email });
    if (!user)
      return {
        status: true,
        statusCode: 200,
        message: "If the email exists, reset was sent",
        data: {},
      };

    const token = Math.random().toString(36).slice(2, 10);
    await Session.create({
      user_id: user._id,
      reset_token: token,
      purpose: "password_reset",
      expires_at: new Date(Date.now() + 15 * 60 * 1000),
    });

    return {
      status: true,
      statusCode: 200,
      message: "Reset email sent",
      data: {},
    };
  } catch (e) {
    return { status: false, statusCode: 500, message: e.message, data: {} };
  }
};

// --- Reset Password Service ---
exports.resetPasswordService = async (token, password) => {
  try {
    const reset = await Session.findOne({
      reset_token: token,
      purpose: "password_reset",
    });

    if (!reset || (reset.expires_at && reset.expires_at < new Date())) {
      return {
        status: false,
        statusCode: 400,
        message: "Invalid or expired token",
        data: {},
      };
    }

    const hashedPassword = await hashPassword(password);
    await User.findByIdAndUpdate(reset.user_id, {
      password: hashedPassword,
      confirm_password: hashedPassword,
    });
    await Session.deleteOne({ _id: reset._id });

    return {
      status: true,
      statusCode: 200,
      message: "Password reset",
      data: {},
    };
  } catch (e) {
    return { status: false, statusCode: 500, message: e.message, data: {} };
  }
};

// --- Stubbed features ---
exports.socialLoginService = async () => ({
  status: true,
  statusCode: 200,
  message: "Social login not yet implemented",
  data: {},
});
exports.verifyEmailService = async () => ({
  status: true,
  statusCode: 200,
  message: "Email verification not yet implemented",
  data: {},
});
exports.verifyPhoneService = async () => ({
  status: true,
  statusCode: 200,
  message: "Phone verification not yet implemented",
  data: {},
});
exports.setup2FAService = async () => ({
  status: true,
  statusCode: 200,
  message: "2FA setup not yet implemented",
  data: {},
});
exports.verify2FAService = async () => ({
  status: true,
  statusCode: 200,
  message: "2FA verify not yet implemented",
  data: {},
});
