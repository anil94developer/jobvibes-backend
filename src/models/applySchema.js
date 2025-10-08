const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    feedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feed",
      required: true,
    },
    is_applied: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ✅ Export the model, not the schema
module.exports = mongoose.model("Application", ApplicationSchema);
