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
      lowercase: true,
      trim: true,
    },
    password: { type: String },

    // Role
    role: {
      type: String,
      enum: ["candidate", "employer"],
    },

    // Common fields
    name: { type: String },
    profile_image: { type: String, default: "" },
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
      type: [String], // 👈 array of strings
      enum: ["freelance", "full_time", "part_time"],
      default: [],
    },

    // Employer-specific fields
    company_name: { type: String },
    about_company: { type: String },
    company_address: { type: String },
    team_size: { type: Number, min: 1 }, // 👈 NEW
    position: { type: String }, // 👈 NEW
    representative_role: { type: String },

    // Step 3 fields
    skip_step_3: { type: Boolean, default: false },

    fcm_token: {
      type: String,
    },
    // 👇 New field
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "inactive",
    },
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
