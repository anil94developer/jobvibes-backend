const User = require("../../models/userSchema");
const Session = require("../../models/sessionSchema");
const Otp = require("../../models/otpSchema");
const {
  hashPassword,
  comparePassword,
  issueTokens,
  verifyToken,
  generateOtp,
} = require("../../utility/authUtils");

// ✅ destructure safe fields from user
function destructureUser(user) {
  if (!user) return {};
  const { _id, user_name, phone_number, email } = user;
  return {
    id: _id,
    user_name,
    phone_number,
    email,
  };
}

exports.requestOtpService = async (req) => {
  try {
    const { phone } = req.body;
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create({ phone, code, expires_at: expiresAt });

    return { status: true, message: "OTP sent", data: { ttl: 300 } };
  } catch (e) {
    return { status: false, message: e.message, data: {} };
  }
};

exports.verifyOtpService = async (req) => {
  try {
    const { phone, code } = req.body;
    const otp = await Otp.findOne({ phone, code }).sort({ createdAt: -1 });

    if (!otp || otp.expires_at < new Date()) {
      return { status: false, message: "Invalid or expired OTP", data: {} };
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
      });
    }

    const session = await Session.create({
      user_id: user._id,
      user_agent: req.headers["user-agent"] || "",
      ip: req.ip || "",
    });

    const tokens = issueTokens(user._id.toString(), session._id.toString());

    const { id, user_name, phone_number, email } = destructureUser(user);

    return {
      status: true,
      message: "OTP verified",
      data: {
        id,
        user_name,
        phone_number,
        email,
        tokens,
      },
    };
  } catch (e) {
    return { status: false, message: e.message, data: {} };
  }
};

exports.registerService = async (req) => {
  try {
    const { phone_number, user_name, email, password } = req.body;

    // Check if phone_number or user_name already exists
    const existsPhone = await User.findOne({ phone_number });
    if (existsPhone) {
      return { status: false, message: "Phone already registered", data: {} };
    }

    const existsUserName = await User.findOne({ user_name });
    if (existsUserName) {
      return { status: false, message: "User name already taken", data: {} };
    }

    // Optional email uniqueness
    if (email) {
      const existsEmail = await User.findOne({ email });
      if (existsEmail) {
        return { status: false, message: "Email already registered", data: {} };
      }
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      ...req.body,
      password: hashedPassword,
      confirm_password: hashedPassword,
    });

    const session = await Session.create({
      user_id: user._id,
      user_agent: req.headers["user-agent"] || "",
      ip: req.ip || "",
    });

    const tokens = issueTokens(user._id.toString(), session._id.toString());
    const { id, user_name: name, phone_number: phone } = destructureUser(user);

    return {
      status: true,
      message: "Registered",
      data: {
        id,
        user_name: name,
        phone_number: phone,
        email,
        tokens,
      },
    };
  } catch (e) {
    return { status: false, message: e.message, data: {} };
  }
};

exports.loginService = async (req) => {
  try {
    const { identifier, password } = req.body; // identifier = phone_number OR user_name

    // Find user by phone_number OR user_name
    const user = await User.findOne({
      $or: [{ phone_number: identifier }, { user_name: identifier }],
    });

    if (!user) {
      return { status: false, message: "Invalid credentials", data: {} };
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return { status: false, message: "Invalid credentials", data: {} };
    }

    const session = await Session.create({
      user_id: user._id,
      user_agent: req.headers["user-agent"] || "",
      ip: req.ip || "",
    });

    const tokens = issueTokens(user._id.toString(), session._id.toString());
    const { id, user_name, phone_number } = destructureUser(user);

    return {
      status: true,
      message: "Logged in",
      data: {
        id,
        user_name,
        phone_number,
        email: user.email,
        tokens,
      },
    };
  } catch (e) {
    return { status: false, message: e.message, data: {} };
  }
};

exports.logoutService = async (req) => {
  try {
    const sessionId = req.user?.sid;
    if (sessionId) {
      await Session.findByIdAndUpdate(sessionId, {
        revoked: true,
        revoked_at: new Date(),
      });
    }
    return { status: true, message: "Logged out", data: {} };
  } catch (e) {
    return { status: false, message: e.message, data: {} };
  }
};

exports.refreshTokenService = async (req) => {
  try {
    const { refresh_token } = req.body;
    const payload = verifyToken(refresh_token, "refresh");

    if (!payload) return { status: false, message: "Invalid token", data: {} };

    const session = await Session.findById(payload.sid);
    if (!session || session.revoked) {
      return { status: false, message: "Invalid session", data: {} };
    }

    const tokens = issueTokens(payload.sub, payload.sid);
    return { status: true, message: "Refreshed", data: { tokens } };
  } catch (e) {
    return { status: false, message: e.message, data: {} };
  }
};

exports.getMeService = async (req) => {
  try {
    const user = await User.findById(req.user.sub, {
      _id: 1,
      user_name: 1,
      email: 1,
      phone_number: 1,
    });

    if (!user) {
      return { status: false, message: "Not found", data: {} };
    }

    const { id, user_name, email, phone_number } = destructureUser(user);

    return {
      status: true,
      message: "Me",
      data: { id, user_name, email, phone_number },
    };
  } catch (e) {
    return { status: false, message: e.message, data: {} };
  }
};

exports.revokeSessionService = async (req) => {
  try {
    const { id } = req.params;
    await Session.findOneAndUpdate(
      { _id: id, user_id: req.user.sub },
      { revoked: true, revoked_at: new Date() }
    );

    return { status: true, message: "Session revoked", data: {} };
  } catch (e) {
    return { status: false, message: e.message, data: {} };
  }
};

exports.forgotPasswordService = async (req) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return {
        status: true,
        message: "If the email exists, reset was sent",
        data: {},
      };
    }

    const token = Math.random().toString(36).slice(2, 10);
    await Session.create({
      user_id: user._id,
      reset_token: token,
      purpose: "password_reset",
      expires_at: new Date(Date.now() + 15 * 60 * 1000),
    });

    // ⚠️ Don’t expose token in response for security
    return { status: true, message: "Reset email sent", data: {} };
  } catch (e) {
    return { status: false, message: e.message, data: {} };
  }
};

exports.resetPasswordService = async (req) => {
  try {
    const { token, password } = req.body;
    const reset = await Session.findOne({
      reset_token: token,
      purpose: "password_reset",
    });

    if (!reset || (reset.expires_at && reset.expires_at < new Date())) {
      return { status: false, message: "Invalid or expired token", data: {} };
    }

    const hashedPassword = await hashPassword(password);
    await User.findByIdAndUpdate(reset.user_id, {
      password: hashedPassword,
      confirm_password: hashedPassword,
    });

    await Session.deleteOne({ _id: reset._id });
    return { status: true, message: "Password reset", data: {} };
  } catch (e) {
    return { status: false, message: e.message, data: {} };
  }
};

// --- Stubbed features ---
exports.socialLoginService = async () => ({
  status: true,
  message: "Social login not yet implemented",
  data: {},
});
exports.verifyEmailService = async () => ({
  status: true,
  message: "Email verification not yet implemented",
  data: {},
});
exports.verifyPhoneService = async () => ({
  status: true,
  message: "Phone verification not yet implemented",
  data: {},
});
exports.setup2FAService = async () => ({
  status: true,
  message: "2FA setup not yet implemented",
  data: {},
});
exports.verify2FAService = async () => ({
  status: true,
  message: "2FA verify not yet implemented",
  data: {},
});
