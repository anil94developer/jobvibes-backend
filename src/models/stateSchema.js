const mongoose = require("mongoose");

const stateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // prevent duplicates
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("State", stateSchema);
