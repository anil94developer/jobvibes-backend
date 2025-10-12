const User = require("../../models/userSchema");
const Session = require("../../models/sessionSchema");
const Feed = require("../../models/feedSchema");
const Reaction = require("../../models/reactionSchema");
const File = require("../../models/fileSchema"); // import your File schema
const Skill = require("../../models/skillsSchema");
const { destructureUser } = require("../../utility/responseFormat");
const notificationEmitter = require("../../emitter/notificationEmitter");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const CONSTANT = require("../../utility/constant");
const { getPaginatedResults } = require("../../utility/paginate");

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
        state,
        city,
        team_size,
        position,
        representative_role,
      } = req.body;

      // Required field validation
      if (
        !company_name ||
        !about_company ||
        !company_address ||
        !state ||
        !city
      ) {
        return {
          status: false,
          statusCode: 400,
          message:
            "Employer must provide company_name, about_company, company_address, state, and city",
          data: {},
        };
      }

      updateFields = {
        company_name: company_name.trim(),
        about_company: about_company.trim(),
        company_address: company_address.trim(),
        state: state.trim(),
        city: city.trim(),
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
      const { skills, experience, qualifications, job_type } = req.body;
      const allowedJobTypes = ["freelance", "full_time", "part_time"];

      if (!skills || !job_type) {
        return {
          status: false,
          statusCode: 400,
          message:
            "Candidate must provide skills, experience, qualifications and job_type",
          data: {},
        };
      }

      // ✅ Ensure job_type is an array of strings
      if (!Array.isArray(job_type) || job_type.length === 0) {
        return {
          status: false,
          statusCode: 400,
          message: "job_type must be a non-empty array of strings",
          data: {},
        };
      }

      // ✅ Validate array values
      const invalidTypes = job_type.filter(
        (type) => !allowedJobTypes.includes(type)
      );
      if (invalidTypes.length > 0) {
        return {
          status: false,
          statusCode: 400,
          message: `Invalid job_type(s): ${invalidTypes.join(
            ", "
          )}. Allowed values: freelance, full_time, part_time`,
          data: {},
        };
      }

      updateFields = {
        skills,
        experience,
        qualifications,
        job_type, // store as array
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

    // Build update object only with provided fields
    let updateFields = {};
    if (description) updateFields.description = description;
    if (intro_video_url) {
      updateFields.intro_video_url = intro_video_url;
      updateFields.status = "active"; // ✅ Set active if intro video exists
    } else {
      updateFields.status = "inactive"; // ✅ Force inactive if no video
    }
    if (skip_step_3) updateFields.skip_step_3 = skip_step_3;

    // Update user
    const updateUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
    });

    // Create session
    await Session.create({
      user_id: userId,
      user_agent: userAgent,
      ip,
    });

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
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "auto",
        });

        // Remove local temp file
        fs.unlinkSync(file.path);

        // Save file record to DB
        const fileDoc = await File.create({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path, // ✅ Local path
          url: result.secure_url, // ✅ Cloudinary public URL
          size: result.bytes,
        });

        return {
          ...fileDoc._doc,
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

// --- Resume Upload Service ---
exports.resumeServices = async (req) => {
  try {
    const userId = req.user.sub;
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

    if (user.role !== "candidate") {
      return {
        status: false,
        statusCode: 400,
        message: "Only candidates can upload resumes",
        data: {},
      };
    }

    if (!req.file) {
      return {
        status: false,
        statusCode: 400,
        message: "No file uploaded",
        data: {},
      };
    }

    const file = req.file;

    // Check if a resume already exists for this user
    const existingResume = await File.findOne({ user: userId, type: "resume" });

    // Upload new file to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "auto",
    });

    // Remove temp file
    fs.unlinkSync(file.path);

    // Delete old resume if it exists
    if (existingResume) {
      try {
        await cloudinary.uploader.destroy(existingResume.public_id);
        await File.deleteOne({ _id: existingResume._id });
      } catch (err) {
        console.error("Error removing old resume:", err.message);
      }
    }

    // Save new resume metadata in DB
    const newResume = await File.create({
      user: userId,
      filename: file.filename,
      originalName: file.originalname,
      path: file.path, // ✅ local file path (before deletion)
      url: result.secure_url, // ✅ Cloudinary public URL
      size: result.bytes,
      public_id: result.public_id,
      type: "resume",
    });

    user.resume_url = result.secure_url;
    const updatedUserInfo = await user.save();

    return {
      status: true,
      statusCode: 200,
      message: existingResume
        ? "Resume updated successfully"
        : "Resume uploaded successfully",
      data: updatedUserInfo,
    };
  } catch (error) {
    console.error("Resume upload/update error:", error);
    return {
      status: false,
      statusCode: 500,
      message: error.message,
      data: {},
    };
  }
};

exports.skillsServices = async (req) => {
  try {
    const queryParams = req.query;

    // Parse query parameters with strict validation
    const pageNum = parseInt(queryParams?.page, 10);
    const page = !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;

    const limitNum = parseInt(queryParams?.limit, 10);
    const limit =
      !isNaN(limitNum) && limitNum > 0 ? Math.min(limitNum, 100) : 10;

    const search =
      typeof queryParams?.search === "string" ? queryParams.search : "";

    const filter = search ? { name: { $regex: search, $options: "i" } } : {};

    const skip = (page - 1) * limit;

    // Execute queries
    const [skills, total] = await Promise.all([
      Skill.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
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
          page,
          limit,
          totalPages,
        },
      },
    };
  } catch (error) {
    console.error("Error in skillsServices:", error.message);
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
        team_size,
        location,
        city,
        position, // 👈 NEW
        representative_role,
      } = req.body;
      if (name) updateFields.name = name;
      if (email) updateFields.email = email;
      if (gender) updateFields.gender = gender;
      if (company_name) updateFields.company_name = company_name;
      if (about_company) updateFields.about_company = about_company;
      if (company_address) updateFields.company_address = company_address;
      if (profile_image) updateFields.profile_image = profile_image;
      if (team_size) updateFields.team_size = team_size;
      if (location) updateFields.location = location;
      if (city) updateFields.city = city;
      if (position) updateFields.position = position; // 👈 NEW
      if (representative_role)
        updateFields.representative_role = representative_role;
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

exports.getUserFeedServices = async (req) => {
  try {
    const { userId } = req.params; // userId whose feeds we need
    console.log("------ ~ userId:------", userId);
    const { page = 1, limit = 10 } = req.query;
    const currentUserId = req.user.sub;

    // ✅ Check if profile exists
    const profile = await User.findById(userId);
    console.log("------ ~ profile:------", profile);
    if (!profile) {
      return {
        status: false,
        statusCode: 404,
        message: "Profile not found",
        data: {},
      };
    }

    // ✅ Get feeds for that user with pagination
    const paginated = await getPaginatedResults(
      Feed,
      { authorId: userId }, // filter: only this user’s feeds
      {
        page,
        limit,
        sort: { createdAt: -1 },
        populate: {
          path: "authorId",
          select:
            "name profile_image username email role company_name about_company",
        },
        lean: true,
      }
    );

    if (!paginated.status) return paginated;

    const feeds = paginated.data.results || [];
    const feedIds = feeds.map((f) => f._id);

    if (feeds.length > 0) {
      profile.is_feed_posted = true;
    } else {
      profile.is_feed_posted = false;
    }
    await profile.save();

    // ✅ Check if current user reacted to these feeds
    const userReactions = await Reaction.find({
      userId: currentUserId,
      feedId: { $in: feedIds },
    }).lean();

    const reactionMap = {};
    userReactions.forEach((r) => {
      reactionMap[r.feedId.toString()] = r;
    });

    // ✅ Transform feeds with extra info
    const feedsWithExtras = feeds.map((feed) => {
      const reaction = reactionMap[feed._id.toString()];
      const isReacted = !!reaction;
      const ratingValue = reaction ? reaction.ratingValue : 0;
      const { authorId, ...rest } = feed;

      return { ...rest, authorDetails: authorId, isReacted, ratingValue };
    });

    return {
      status: true,
      statusCode: 200,
      message: "Profile feeds fetched successfully",
      data: {
        profile: destructureUser(profile),
        feeds: feedsWithExtras,
        pagination: paginated.data.pagination,
      },
    };
  } catch (err) {
    console.error("❌ Error in getFeedServices:", err);
    return {
      status: false,
      statusCode: 500,
      message: "Error fetching profile feeds",
      data: { error: err.message },
    };
  }
};
