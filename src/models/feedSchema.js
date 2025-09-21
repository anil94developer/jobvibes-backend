const mongoose = require("mongoose");

const FeedSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorRole: {
      type: String,
      enum: ["candidate", "employer"],
      required: true,
    },

    // Either content or media is required (you can enforce at app-level via Joi)
    content: { type: String },
    media: [{ type: String }],

    job_title: [{ type: String }],
    work_place_name: [{ type: String }],
    job_type: [{ type: String }],
    cities: [{ type: String }],

    noOfReactions: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Optional: Add a schema-level validation hook
FeedSchema.pre("validate", function (next) {
  // Require at least content or media
  if (!this.content && (!this.media || this.media.length === 0)) {
    return next(new Error("Either content or media is required"));
  }

  // Require at least one of job_title, work_place_name, job_type, cities
  if (
    (!this.job_title || this.job_title.length === 0) &&
    (!this.work_place_name || this.work_place_name.length === 0) &&
    (!this.job_type || this.job_type.length === 0) &&
    (!this.cities || this.cities.length === 0)
  ) {
    return next(
      new Error(
        "At least one of job_title, work_place_name, job_type, or cities is required"
      )
    );
  }

  next();
});

module.exports = mongoose.model("Feed", FeedSchema);
