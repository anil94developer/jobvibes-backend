const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sessionSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    user_agent: { type: String, default: "" },
    ip: { type: String, default: "" },
    revoked: { type: Boolean, default: false },
    revoked_at: { type: Date },
    // optional fields for other flows
    reset_token: { type: String },
    purpose: { type: String },
    expires_at: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
