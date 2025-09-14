const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true }, // saved file name
  originalName: { type: String, required: true }, // original file name
  path: { type: String, required: true }, // server path (uploads/...)
  size: { type: Number, required: true }, // file size in bytes
  url: { type: String, required: true }, // ✅ public URL for frontend
  uploadedAt: { type: Date, default: Date.now }, // timestamp
});

module.exports = mongoose.model("File", fileSchema);
