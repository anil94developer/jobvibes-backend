// ✅ Destructure safe fields from user
exports.destructureUser = (user) => {
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
};

exports.sendResponse = (res, data) => {
  res.status(data.statusCode || 200).json(data);
};
