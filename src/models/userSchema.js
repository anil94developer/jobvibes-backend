const mongoose = require("mongoose");
const Skill = require("./skillsSchema"); // Adjust path if needed

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
      default: generateRandomUsername,
    },
    phone_number: { type: String, required: true },
    email: {
      type: String,
      default: null,
    },
    password: { type: String },

    // Role
    role: {
      type: String,
      enum: ["candidate", "employer"],
      required: [true, "Role is required"],
    },

    // Common fields
    name: { type: String },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },

    // Candidate-specific fields
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
          ctc: { type: String },
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

    // Candidate job preferences
    job_type: {
      type: String,
      enum: ["freelance", "full_time", "part_time"],
    },

    // Employer-specific fields
    company_name: { type: String },
    about_company: { type: String },
    company_address: { type: String },
  },
  { timestamps: true }
);

// Pre-save hook to ensure unique username (in app logic, not DB index)
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

// Post-save hook to sync new skills to Skill collection
userSchema.post("save", async function (doc) {
  try {
    const userSkills = doc.skills || [];
    if (!userSkills.length) return;

    // Find existing skills
    const existingSkills = await Skill.find({
      name: { $in: userSkills },
    }).select("name");

    const existingNames = existingSkills.map((s) => s.name);

    // Insert any new skills
    const newSkills = userSkills.filter(
      (skill) => !existingNames.includes(skill)
    );
    if (newSkills.length > 0) {
      const skillsToInsert = newSkills.map((name) => ({ name }));
      await Skill.insertMany(skillsToInsert);
    }
  } catch (error) {
    console.error("Error syncing skills:", error);
  }
});

module.exports = mongoose.model("User", userSchema);
