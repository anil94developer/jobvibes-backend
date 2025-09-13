const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    user_name: { type: String, required: true },
    phone_number: { type: String, required: true, unique: true },
    email: { type: String, unique: true },
    password: { type: String, required: true },

    // User role: candidate or employer
    role: {
      type: String,
      enum: ["candidate", "employer"],
      default: "candidate",
    },

    // Candidate-specific fields
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
      default: "prefer_not_to_say",
    },
    skills: { type: [String], default: [] },
    qualifications: { type: [String], default: [] },
    intro_video_url: { type: String, default: "" },
    resume_url: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
