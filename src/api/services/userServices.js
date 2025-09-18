const User = require("../../models/userSchema");
const Session = require("../../models/sessionSchema");
const Feed = require("../../models/feedSchema");
const File = require("../../models/fileSchema"); // import your File schema
const Skill = require("../../models/skillsSchema");
const { destructureUser } = require("../../utility/responseFormat");
const notificationEmitter = require("../../emitter/notificationEmitter");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const CONSTANT = require("../../utility/constant");

cloudinary.config({
  cloud_name: CONSTANT.CLOUDINARY_CLOUD_NAME,
  api_key: CONSTANT.CLOUDINARY_API_KEY,
  api_secret: CONSTANT.CLOUDINARY_API_SECRET,
});

// --- Candidate step 1 Service ---
exports.step1Services = async (req) => {
  try {
    const userId = req.user?.sub;
    const userAgent = req.headers["user-agent"] || "unknown";
    const ip = req.ip || req.connection.remoteAddress;
    const { name, email, gender, role, profile_image } = req.body;

    // Check if userId is present
    if (!userId) {
      return {
        status: false,
        statusCode: 400,
        message: "User not found",
        data: {},
      };
    }

    // Validate role
    const allowedRoles = ["candidate", "employer"];
    if (!role || !allowedRoles.includes(role)) {
      return {
        status: false,
        statusCode: 400,
        message: "Invalid or missing role",
        data: {},
      };
    }

    // Validate email (basic format)
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        status: false,
        statusCode: 400,
        message: "Invalid or missing email",
        data: {},
      };
    }

    // If candidate, require name and gender
    if (role === "candidate") {
      if (!name || typeof name !== "string" || name.trim().length < 2) {
        return {
          status: false,
          statusCode: 400,
          message: "Name is required and must be at least 2 characters",
          data: {},
        };
      }

      if (
        !gender ||
        !["male", "female", "other"].includes(gender.toLowerCase())
      ) {
        return {
          status: false,
          statusCode: 400,
          message: "Invalid or missing gender",
          data: {},
        };
      }
    }

    let updateFields = {};
    if (role === "candidate") {
      updateFields = {
        name: name.trim(),
        email: email.toLowerCase(),
        gender: gender.toLowerCase(),
        role,
        profile_image,
      };
    } else {
      updateFields = {
        email: email.toLowerCase(),
        role,
        profile_image,
      };
    }

    const updateUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
    });

    if (!updateUser) {
      return {
        status: false,
        statusCode: 404,
        message: "User not found",
        data: {},
      };
    }

    await Session.create({
      user_id: userId,
      user_agent: userAgent,
      ip,
    });

    return {
      status: true,
      statusCode: 201,
      message: "Registered",
      data: { ...destructureUser(updateUser) },
    };
  } catch (e) {
    return { status: false, statusCode: 500, message: e.message, data: {} };
  }
};

// --- Candidate step 2 Service ---
exports.step2Services = async (req) => {
  try {
    const userId = req.user?.sub;
    const userAgent = req.headers["user-agent"] || "unknown";
    const ip = req.ip || req.connection?.remoteAddress;

    if (!userId) {
      return {
        status: false,
        statusCode: 400,
        message: "User not found",
        data: {},
      };
    }

    const user = await User.findById(userId);
    if (!user) {
      return {
        status: false,
        statusCode: 404,
        message: "User not found",
        data: {},
      };
    }

    let updateFields = {};

    // Role-based validation
    if (user.role === "employer") {
      const {
        company_name,
        about_company,
        company_address,
        team_size,
        position,
        representative_role,
      } = req.body;

      // Required field validation
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
        company_name: company_name.trim(),
        about_company: about_company.trim(),
        company_address: company_address.trim(),
      };

      // Optional fields (validate only if provided)
      if (team_size) {
        if (isNaN(team_size) || parseInt(team_size) <= 0) {
          return {
            status: false,
            statusCode: 400,
            message: "Invalid team_size. Must be a positive number",
            data: {},
          };
        }
        updateFields.team_size = parseInt(team_size);
      }

      if (position) {
        updateFields.position = position.trim();
      }

      if (representative_role) {
        updateFields.representative_role = representative_role.trim();
      }
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
            "Candidate must provide skills, experience, qualifications, resume_url, and job_type",
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

    // Update user with validated fields
    const updateUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
    });

    if (!updateUser) {
      return {
        status: false,
        statusCode: 404,
        message: "User not found during update",
        data: {},
      };
    }

    // Create session
    await Session.create({
      user_id: userId,
      user_agent: userAgent,
      ip,
    });

    // TODO: Issue tokens if needed

    return {
      status: true,
      statusCode: 201,
      message: "Registered",
      data: { ...destructureUser(updateUser) },
    };
  } catch (e) {
    console.log("Error in step2Services:--", e);
    return { status: false, statusCode: 500, message: e.message, data: {} };
  }
};

// --- Candidate/Employer step 3 Service ---
exports.step3Services = async (req) => {
  try {
    const userId = req.user.sub;
    const userAgent = req.headers["user-agent"];
    const ip = req.ip;
    const { description, intro_video_url, skip_step_3 } = req.body;

    if (!userId) {
      return {
        status: false,
        statusCode: 400,
        message: "User not found",
        data: {},
      };
    }

    if (skip_step_3) {
      updateFields.skip_step_3 = skip_step_3;
    }

    // Build update object only with provided fields
    let updateFields = {};
    if (description) updateFields.description = description;
    if (intro_video_url) updateFields.intro_video_url = intro_video_url;
    if (skip_step_3) updateFields.skip_step_3 = skip_step_3;

    // Update user
    const updateUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
    });
    console.log("------ ~ updateUser:------", updateUser);

    // Create session (optional for step-3, but keeping consistent)
    const session = await Session.create({
      user_id: userId,
      user_agent: userAgent,
      ip,
    });

    // post intro URL as feed
    if (intro_video_url) {
      const feed = await Feed.create({
        authorId: userId,
        media: [intro_video_url],
      });

      notificationEmitter.emit("sendNotification", {
        title: "New Feed",
        body: "New video available!",
        token: updateUser.fcm_token,
        posted_by: userId,
        data: {
          type: "feed",
          feedId: feed._id,
        },
      });
    }

    // Issue tokens

    return {
      status: true,
      statusCode: 201,
      message: "Profile updated (Step 3)",
      data: { ...destructureUser(updateUser) },
    };
  } catch (e) {
    return { status: false, statusCode: 500, message: e.message, data: {} };
  }
};

// / --- Upload Service ---
exports.uploadServices = async (req) => {
  try {
    if (!req.files || req.files.length === 0) {
      return {
        status: false,
        statusCode: 400,
        message: "No files uploaded",
        data: {},
      };
    }

    const uploads = await Promise.all(
      req.files.map(async (file) => {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "auto",
        });

        fs.unlinkSync(file.path);

        return {
          filename: file.filename,
          originalName: file.originalname,
          size: result.bytes,
          url: result.secure_url,
          public_id: result.public_id,
        };
      })
    );

    return {
      status: true,
      statusCode: 200,
      message: "Files uploaded successfully",
      data: uploads,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      status: false,
      statusCode: 500,
      message: error.message,
      data: {},
    };
  }
};

exports.skillsServices = async (queryParams) => {
  try {
    // Destructure query parameters
    const { page = 1, limit = 10, search = "" } = queryParams;

    const filter = search
      ? { name: { $regex: search, $options: "i" } } // case-insensitive search
      : {};

    const skip = (page - 1) * limit;

    const [skills, total] = await Promise.all([
      Skill.find(filter)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit)),
      Skill.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      status: true,
      statusCode: 200,
      message: "Skills fetched successfully",
      data: {
        skills,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages,
        },
      },
    };
  } catch (error) {
    console.error("An error occurred:", error);
    return {
      status: false,
      statusCode: 500,
      message: error.message,
      data: {},
    };
  }
};

// --- Update profile service ---
exports.updateProfileServices = async (req) => {
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
    if (!user) {
      return {
        status: false,
        statusCode: 404,
        message: "User not found",
        data: {},
      };
    }

    let updateFields = {};

    // Candidate fields
    if (user.role === "candidate") {
      const {
        name,
        profile_image,
        email,
        gender,
        skills,
        experience,
        qualifications,
        resume_url,
        job_type,
        description,
        intro_video_url,
      } = req.body;

      if (skills && Array.isArray(skills)) {
        updateFields.skills = skills;
      }

      // Partial updates only
      if (name) updateFields.name = name;
      if (email) updateFields.email = email;
      if (gender) updateFields.gender = gender;
      if (experience) updateFields.experience = experience;
      if (qualifications) updateFields.qualifications = qualifications;
      if (resume_url) updateFields.resume_url = resume_url;
      if (job_type) updateFields.job_type = job_type;
      if (description) updateFields.description = description;
      if (intro_video_url) updateFields.intro_video_url = intro_video_url;
      if (profile_image) updateFields.profile_image = profile_image;
    }

    // Employer fields
    if (user.role === "employer") {
      const {
        name,
        profile_image,
        email,
        gender,
        company_name,
        about_company,
        company_address,
      } = req.body;
      if (name) updateFields.name = name;
      if (email) updateFields.email = email;
      if (gender) updateFields.gender = gender;
      if (company_name) updateFields.company_name = company_name;
      if (about_company) updateFields.about_company = about_company;
      if (company_address) updateFields.company_address = company_address;
      if (profile_image) updateFields.profile_image = profile_image;
    }

    // Update user in DB
    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
      runValidators: true,
    });

    // Create session (optional, can be removed if not needed for update)
    const session = await Session.create({
      user_id: userId,
      user_agent: userAgent,
      ip,
    });

    return {
      status: true,
      statusCode: 200,
      message: "Profile updated successfully",
      data: { ...destructureUser(updatedUser) },
    };
  } catch (error) {
    console.error("Error in updateProfileServices:", error);
    return { status: false, statusCode: 500, message: error.message, data: {} };
  }
};

exports.getProfileServices = async (req) => {
  try {
    const { id } = req.params;
    const profile = await User.findById(id);
    if (!profile) {
      throw new Error("Profile not found");
    }
    return {
      status: true,
      statusCode: 200,
      message: "Profile data fetch successfully!!",
      data: { ...destructureUser(updatedUser) },
    };
  } catch (err) {
    throw err;
  }
};
