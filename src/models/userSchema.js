const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the user schema
const userSchema = new Schema(
  {
    user_name: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      required: true,
      unique: true, // ✅ phone must be unique
    },
    email: {
      type: String,
      required: false, // ✅ optional
      unique: true, // ✅ unique if provided
      sparse: true, // ✅ allows multiple null/missing
    },
    password: {
      type: String,
      required: true,
    },
    confirm_password: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false, // ✅ better default (not deleted)
    },
  },
  { timestamps: true }
);

// Create a User model using the schema
const User = mongoose.model("User", userSchema);

module.exports = User;
