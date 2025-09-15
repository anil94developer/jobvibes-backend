const mongoose = require("mongoose");

const ReactionSchema = new mongoose.Schema(
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
    ratingValue: { type: Number, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// ✅ Export the model, not the schema
module.exports = mongoose.model("Reaction", ReactionSchema);
