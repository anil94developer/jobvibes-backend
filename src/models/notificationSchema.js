// models/Notification.js
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    posted_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    token: { type: String }, // device token (or topic)
    topic: { type: String }, // if you send by topic
    data: { type: Object }, // optional custom payload
    sentAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["success", "failed"], default: "success" },
    error: { type: String }, // store error if sending fails
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
