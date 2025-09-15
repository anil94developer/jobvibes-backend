// ✅ Destructure safe fields from user
exports.destructureUser = (user) => {
  if (!user) return {};

  const {
    _id,
    user_name,
    phone_number,
    email,
    role,
    gender,
    name,
    profile_image,

    // Candidate fields
    skills,
    qualifications,
    experience,
    intro_video_url,
    resume_url,
    description,
    job_type,

    // Employer fields
    company_name,
    about_company,
    company_address,
  } = user;

  const baseData = {
    id: _id,
    user_name,
    name,
    profile_image,
    phone_number,
    email,
    role,
    gender,
    intro_video_url,
    description,
  };

  if (role === "candidate") {
    return {
      ...baseData,
      skills,
      qualifications,
      experience,
      resume_url,
      job_type,
    };
  }

  if (role === "employer") {
    return {
      ...baseData,
      company_name,
      about_company,
      company_address,
    };
  }

  // fallback if role is missing
  return baseData;
};

exports.sendResponse = (res, data) => {
  res.status(data.statusCode || 200).json(data);
};

// src/utility/userSteps.js
/**
 * Returns step completion status for a user
 * @param {Object} user - Mongoose User document
 * @returns {Object} - { step1Completed, step2Completed, step3Completed }
 */
exports.getUserStepStatus = async (user) => {
  let step1Completed = false;
  let step2Completed = false;
  let step3Completed = false;

  if (!user) return { step1Completed, step2Completed, step3Completed };

  // Step 1: basic info
  if (user.name && user.role) step1Completed = true;

  // Step 2: role-specific info
  if (
    user.role === "candidate" &&
    Array.isArray(user.skills) &&
    user.skills.length > 0
  ) {
    step2Completed = true;
  }
  if (
    user.role === "employer" &&
    user.company_name &&
    user.about_company &&
    user.company_address
  ) {
    step2Completed = true;
  }

  // Step 3: intro/profile
  if (
    (user.description && user.description.trim() !== "") ||
    (user.intro_video_url && user.intro_video_url.trim() !== "")
  ) {
    step3Completed = true;
  }

  return { step1Completed, step2Completed, step3Completed };
};
