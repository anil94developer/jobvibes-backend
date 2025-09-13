const mongoose = require("mongoose");

// Helper function to generate random username
function generateRandomUsername() {
  const randomStr = Math.random().toString(36).substring(2, 8); // 6 chars
  return `user_${randomStr}`;
}

const userSchema = new mongoose.Schema(
  {
    user_name: {
      type: String,
      required: true,
      unique: true,
      default: generateRandomUsername,
    },
    phone_number: { type: String, required: true, unique: true },
    email: {
      type: String,
      unique: true,
      sparse: true, // ✅ allows multiple docs with null/undefined
      default: null,
    },
    password: { type: String },

    // Role is required
    role: {
      type: String,
      enum: ["candidate", "employer"],
      required: [true, "Role is required"],
    },

    // Candidate-specific fields
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
      // default: "prefer_not_to_say",
    },

    skills: { type: [String], default: [] },
    qualifications: {
      type: [
        {
          school_university_name: { type: String, required: true },
          board_university: { type: String },
          percentage_grade: { type: Number },
          year: { type: Number },
        },
      ],
      default: [],
    },
    experience: {
      type: [
        {
          company_name: { type: String, required: true },
          duration: { type: String },
          ctc: { type: Number },
          role: { type: String },
          start_date: { type: Date },
          end_date: { type: Date },
        },
      ],
      default: [],
    },
    description: { type: String, default: "" },

    intro_video_url: { type: String, default: "" },
    resume_url: { type: String, default: "" },
  },
  { timestamps: true }
);

// Pre-save hook to ensure unique username
userSchema.pre("save", async function (next) {
  if (this.isNew && !this.user_name) {
    let isUnique = false;
    while (!isUnique) {
      this.user_name = generateRandomUsername();
      const existing = await mongoose.models.User.findOne({
        user_name: this.user_name,
      });
      if (!existing) isUnique = true;
    }
  }
  next();
});

module.exports = mongoose.model("User", userSchema);
