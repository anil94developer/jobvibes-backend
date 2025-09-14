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

    if (!userId) {
      return {
        status: false,
        statusCode: 400,
        message: "User not found",
        data: {},
      };
    }

    const user = await User.findById(userId);

    let updateFields = {};
    // Role-based validation
    if (user.role === "employer") {
      const { company_name, about_company, company_address } = req.body;
      if (!company_name || !about_company || !company_address) {
        return {
          status: false,
          statusCode: 400,
          message:
            "Employer must provide company_name, about_company, and company_address",
          data: {},
        };
      }
      updateFields = {
        company_name,
        about_company,
        company_address,
      };
    } else if (user.role === "candidate") {
      const { skills, experience, qualifications, resume_url, job_type } =
        req.body;
      const allowedJobTypes = ["freelance", "full_time", "part_time"];

      if (
        !skills ||
        !experience ||
        !qualifications ||
        !resume_url ||
        !job_type
      ) {
        return {
          status: false,
          statusCode: 400,
          message:
            "Candidate must provide skills, work_experience, qualification, resume, and job_type",
          data: {},
        };
      }

      if (!allowedJobTypes.includes(job_type)) {
        return {
          status: false,
          statusCode: 400,
          message:
            "Invalid job_type. Allowed values: freelance, full_time, part_time",
          data: {},
        };
      }

      updateFields = {
        skills,
        experience,
        qualifications,
        resume_url,
        job_type,
      };
    } else {
      return {
        status: false,
        statusCode: 400,
        message: "Invalid role. Must be employer or candidate",
        data: {},
      };
    }

    // Update user with only allowed fields
    const updateUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
    });

    // Create session
    const session = await Session.create({
      user_id: userId,
      user_agent: userAgent,
      ip,
    });

    // Issue tokens
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

// --- Candidate/Employer step 3 Service ---
exports.step3Services = async (req) => {
  try {
    const userId = req.user.sub;
    const userAgent = req.headers["user-agent"];
    const ip = req.ip;
    const { description, intro_video_url } = req.body;

    if (!userId) {
      return {
        status: false,
        statusCode: 400,
        message: "User not found",
        data: {},
      };
    }

    // Validation: at least one field must be provided
    if (!description && !intro_video_url) {
      return {
        status: false,
        statusCode: 400,
        message: "Either description or intro_video_url is required",
        data: {},
      };
    }

    // Build update object only with provided fields
    let updateFields = {};
    if (description) updateFields.description = description;
    if (intro_video_url) updateFields.intro_video_url = intro_video_url;

    // Update user
    const updateUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
    });

    // Create session (optional for step-3, but keeping consistent)
    const session = await Session.create({
      user_id: userId,
      user_agent: userAgent,
      ip,
    });

    // Issue tokens
    const tokens = issueTokens(userId.toString(), session._id.toString());

    return {
      status: true,
      statusCode: 201,
      message: "Profile updated (Step 3)",
      data: { ...destructureUser(updateUser), tokens },
    };
  } catch (e) {
    return { status: false, statusCode: 500, message: e.message, data: {} };
  }
};
