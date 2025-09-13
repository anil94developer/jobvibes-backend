// --- Candidate step 1 Service ---
exports.candidateStep1Services = async (req) => {
  try {
    const user = req.user.sub;
    const { name, email, gender } = req.body;

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
