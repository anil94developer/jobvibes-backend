const jwt = require("jsonwebtoken");

exports.authenticate = (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token)
      return res
        .status(401)
        .send({ status: false, message: "Unauthorized", data: {} });
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev_secret");
    req.user = payload;
    next();
  } catch (e) {
    return res
      .status(401)
      .send({ status: false, message: "Unauthorized", data: {} });
  }
};
