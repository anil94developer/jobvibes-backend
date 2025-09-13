const User = require("../../models/userSchema");
const Session = require("../../models/sessionSchema");
const { destructureUser } = require("../../utility/responseFormat");
const { issueTokens } = require("../../utility/authUtils");

// --- Candidate step 1 Service ---
exports.step1Services = async (req) => {
  try {
    const userId = req.user.sub;
    const userAgent = req.headers["user-agent"];
    const ip = req.ip;
    console.log("------ ~ user:------", userId);
    const { name, email, gender, role } = req.body;

    if (!userId) {
      return {
        status: false,
        statusCode: 400,
        message: "User not found",
        data: {},
      };
    }

    const updateUser = await User.findByIdAndUpdate(userId, {
      name,
      email,
      gender,
      role,
    });

    const session = await Session.create({
      user_id: userId,
      user_agent: userAgent,
      ip,
    });
    const tokens = issueTokens(userId.toString(), session._id.toString());

    return {
      status: true,
      statusCode: 201,
      message: "Registered",
      data: { ...destructureUser(updateUser), tokens },
    };
  } catch (e) {
    return { status: false, statusCode: 500, message: e.message, data: {} };
  }
};

// --- Candidate step 2 Service ---
exports.step2Services = async (req) => {
  try {
    const userId = req.user.sub;
    const userAgent = req.headers["user-agent"];
    const ip = req.ip;
    console.log("------ ~ user:------", userId);
    const { name, email, gender, role } = req.body;

    if (!userId) {
      return {
        status: false,
        statusCode: 400,
        message: "User not found",
        data: {},
      };
    }

    const updateUser = await User.findByIdAndUpdate(userId, {
      name,
      email,
      gender,
      role,
    });

    const session = await Session.create({
      user_id: userId,
      user_agent: userAgent,
      ip,
    });
    const tokens = issueTokens(userId.toString(), session._id.toString());

    return {
      status: true,
      statusCode: 201,
      message: "Registered",
      data: { ...destructureUser(updateUser), tokens },
    };
  } catch (e) {
    return { status: false, statusCode: 500, message: e.message, data: {} };
  }
};
