// models/citySchema.js
const mongoose = require("mongoose");

const citySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State", // 👈 reference to State collection
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("City", citySchema);
