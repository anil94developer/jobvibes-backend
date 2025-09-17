const dotenv = require("dotenv").config({ path: ".env" });

const CONSTANT = {
  DB_URL: process.env.MONGO_URI,
  NODE_PORT: process.env.NODE_PORT,
  BASE_URL: process.env.BASE_URL,

  // ✅ Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

module.exports = CONSTANT;
