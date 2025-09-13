const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ACCESS_TTL_SEC = 60 * 15; // 15 minutes
const REFRESH_TTL_SEC = 60 * 60 * 24 * 30; // 30 days

// 🔑 Hash a password
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// 🔑 Compare raw password with hashed password
async function comparePassword(password, hashed) {
  return bcrypt.compare(password, hashed);
}

// 🔑 Issue JWT access + refresh tokens
function issueTokens(userId, sessionId) {
  const accessToken = jwt.sign(
    { sub: userId, sid: sessionId },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: ACCESS_TTL_SEC }
  );

  const refreshToken = jwt.sign(
    { sub: userId, sid: sessionId, type: "refresh" },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "dev_refresh",
    { expiresIn: REFRESH_TTL_SEC }
  );

  return { accessToken, refreshToken, expiresIn: ACCESS_TTL_SEC };
}

// 🔑 Verify any JWT (access/refresh)
function verifyToken(token, type = "access") {
  try {
    const secret =
      type === "refresh"
        ? process.env.JWT_REFRESH_SECRET ||
          process.env.JWT_SECRET ||
          "dev_refresh"
        : process.env.JWT_SECRET || "dev_secret";
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
}

// 🔑 Generate 6-digit OTP
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = {
  hashPassword,
  comparePassword,
  issueTokens,
  verifyToken,
  generateOtp,
  ACCESS_TTL_SEC,
  REFRESH_TTL_SEC,
};
