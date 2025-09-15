const mongoose = require("mongoose");
const Reaction = require("./reactionSchema");

const FeedSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true },

    // simplified: array of media URLs only
    media: [{ type: String }],

    // store reactions as subdocs
    reactions: [Reaction],

    // denormalized counts (for quick reads)
    reactionCounts: {
      like: { type: Number, default: 0 },
      love: { type: Number, default: 0 },
      haha: { type: Number, default: 0 },
      wow: { type: Number, default: 0 },
      sad: { type: Number, default: 0 },
      angry: { type: Number, default: 0 },
      ratings: { type: Number, default: 0 }, // total # of rating reactions
      avgRating: { type: Number, default: 0 }, // store computed average
    },
  },
  { timestamps: true }
);

FeedSchema.methods.addReaction = async function (reaction) {
  this.reactions.push(reaction);

  if (reaction.type === "rating") {
    this.reactionCounts.ratings += 1;
    // compute new average rating
    const totalRatings = this.reactions
      .filter((r) => r.type === "rating")
      .map((r) => r.ratingValue);
    this.reactionCounts.avgRating =
      totalRatings.reduce((a, b) => a + b, 0) / totalRatings.length;
  } else {
    this.reactionCounts[reaction.type] =
      (this.reactionCounts[reaction.type] || 0) + 1;
  }

  await this.save();
};

module.exports = mongoose.model("feed", FeedSchema);
