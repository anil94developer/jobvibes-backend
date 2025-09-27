const { Types } = require("mongoose");
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
const jwt = require("jsonwebtoken");
const {
  destructureUser,
  getUserStepStatus,
} = require("../../utility/responseFormat");
const path = require("path");
const { sendEmail } = require("./emailService");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 20000, // 20 seconds
});

// --- OTP Services ---
exports.requestOtpService = async (phone) => {
  try {
    const firebaseToken = await admin.auth().createCustomToken(phone);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins expiry

    await Otp.create({
      phone,
      fcm_token: firebaseToken,
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
  fcm_token,
  role,
  gender,
  userAgent = "",
  ip = ""
) => {
  try {
    const otpRecord = await Otp.findOne({ phone, fcm_token }).sort({
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

// ---- Token Registration ---- //
exports.tokenRegisterService = async (body, userAgent = "", ip = "") => {
  try {
    const { token, fcm_token } = body;

    // ✅ Decode Firebase JWT (no signature verification here)
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) {
      return {
        status: false,
        statusCode: 400,
        message: "Invalid token",
        data: {},
      };
    }

    const phone = decoded.payload?.phone_number;
    if (!phone) {
      return {
        status: false,
        statusCode: 400,
        message: "Phone number not found in token",
        data: {},
      };
    }

    // Check if user exists
    let user = await User.findOne({ phone_number: phone });

    if (!user) {
      // const password = await hashPassword("otp_only");
      user = await User.create({
        user_name: `user_${Date.now()}`, // random unique username
        phone_number: phone,
        fcm_token: fcm_token,
        // email: `${phone}@placeholder.local`,
        // password,
        // confirm_password: password,
        // role: role || "candidate",
        // gender: gender || "",
      });
    }

    await User.updateOne({ _id: user._id }, { fcm_token });

    // Create session
    const session = await Session.create({
      user_id: user._id,
      user_agent: userAgent,
      ip,
    });

    // Issue JWT tokens
    const tokens = issueTokens(user._id.toString(), session._id.toString());

    const getStatus = await getUserStepStatus(user);

    return {
      status: true,
      statusCode: 200,
      message: "Token decoded & user registered",
      data: {
        id: user._id,
        user_name: user.user_name,
        phone_number: user.phone_number,
        email: user.email,
        role: user.role,
        gender: user.gender,
        tokens,
        ...getStatus,
      },
    };
  } catch (error) {
    console.error("Error in tokenRegisterService:", error);
    return {
      status: false,
      statusCode: 500,
      message: error.message,
      data: {},
    };
  }
};

// --- Registration Service ---
exports.registerService = async (body, userAgent = "", ip = "") => {
  try {
    const { phone_number, role } = body;

    if (await User.findOne({ phone_number }))
      return {
        status: false,
        statusCode: 400,
        message: "Phone already registered",
        data: {},
      };

    const user = await User.create({
      phone_number,
      role: role || "candidate",
    });

    const session = await Session.create({
      user_id: user._id,
      user_agent: userAgent,
      ip,
    });
    const tokens = issueTokens(user._id.toString(), session._id.toString());
    const getStatus = await getUserStepStatus(user);
    return {
      status: true,
      statusCode: 201,
      message: "Registered",
      data: { ...destructureUser(user), tokens, ...getStatus },
    };
  } catch (e) {
    return { status: false, statusCode: 500, message: e.message, data: {} };
  }
};

// --- Login Service ---
exports.loginService = async (body, userAgent = "", ip = "") => {
  try {
    const { phone_number } = body;
    const user = await User.findOne({ phone_number });
    if (!user)
      return {
        status: false,
        statusCode: 400,
        message: "User not found",
        data: {},
      };

    const session = await Session.create({
      user_id: user._id,
      user_agent: userAgent,
      ip,
    });
    const tokens = issueTokens(user._id.toString(), session._id.toString());
    const getStatus = await getUserStepStatus(user);
    return {
      status: true,
      statusCode: 200,
      message: "Logged in",
      data: { ...destructureUser(user), tokens, ...getStatus },
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

    const getStatus = await getUserStepStatus(user);
    return {
      status: true,
      statusCode: 200,
      message: "Me",
      data: { ...destructureUser(user), ...getStatus },
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

// --- Update Profile Service ---
exports.updateProfile = async (id, body) => {
  try {
    const updateData = { ...body };

    // ✅ Exclude phone_number from update
    delete updateData.phone_number;

    // ✅ Ensure arrays are properly handled
    if (updateData.skills && !Array.isArray(updateData.skills)) {
      updateData.skills = [updateData.skills];
    }
    if (
      updateData.qualifications &&
      !Array.isArray(updateData.qualifications)
    ) {
      updateData.qualifications = [updateData.qualifications];
    }
    if (updateData.experience && !Array.isArray(updateData.experience)) {
      updateData.experience = [updateData.experience];
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return {
        status: false,
        statusCode: 404,
        message: "User not found",
        data: {},
      };
    }

    return {
      status: true,
      statusCode: 200,
      message: "Profile updated successfully",
      data: destructureUser(updatedUser),
    };
  } catch (error) {
    return {
      status: false,
      statusCode: 500,
      message: "Error updating profile",
      data: { error: error.message },
    };
  }
};

// --- Send OTP Service ---
exports.sendEmailOtpService = async (req) => {
  try {
    const userId = req.user.sub;
    const { email } = req.body;

    if (!email) {
      return {
        status: false,
        statusCode: 400,
        message: "Email is required",
        data: {},
      };
    }

    // 1. Generate OTP
    const otp = generateOtp();

    // 3. Save OTP in DB
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await Otp.create({
      email,
      otp,
      user_id: userId,
      expires_at: expiresAt,
    });

    const emailData = {
      subject: "Your Email Verification OTP",
      otp,
    };

    const emailResult = await sendEmail(email, "verifyEmail", emailData);
    console.log("------ ~ emailResult:------", emailResult);

    // if (!emailResult.status) {
    //   throw new Error(emailResult.message);
    // }

    return {
      status: true,
      message: "OTP sent to email",
      data: {},
    };
  } catch (error) {
    console.error("sendEmailOtpService error:", error);
    return { status: false, message: error.message, data: {} };
  }
};

// --- Validate OTP Service ---
exports.validateEmailOtpService = async (req) => {
  try {
    const userId = req.user.sub;
    console.log("------ ~ userId:------", userId);
    const { otp } = req.body;

    const otpRecord = await Otp.findOne({
      user_id: new Types.ObjectId(userId),
      otp,
    }).sort({ createdAt: -1 });

    if (!otpRecord || otpRecord.expires_at < new Date()) {
      // OTP valid, remove record
      await Otp.deleteOne({ _id: otpRecord._id });
      return { status: false, message: "Invalid or expired OTP", data: {} };
    }

    // OTP valid, remove record
    await Otp.deleteOne({ _id: otpRecord._id });

    return { status: true, message: "OTP verified successfully", data: {} };
  } catch (error) {
    console.error("validateEmailOtpService error:", error);
    return { status: false, message: error.message, data: {} };
  }
};
