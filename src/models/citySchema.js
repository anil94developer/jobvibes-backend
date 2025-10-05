// models/citySchema.js
const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State", // Reference to State collection
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ Make name+state combination unique (so same city name can exist in different states)
citySchema.index({ name: 1, state: 1 }, { unique: true });

module.exports = mongoose.model("City", citySchema);
