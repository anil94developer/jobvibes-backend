const mongoose = require("mongoose");

const ReactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "love", "haha", "wow", "sad", "angry", "rating"],
      required: true,
    },
    ratingValue: { type: Number, min: 1, max: 5 }, // optional: 1-5 star ratings
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = ReactionSchema;
