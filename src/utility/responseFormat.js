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
