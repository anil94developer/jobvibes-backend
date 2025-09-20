// emitter/notificationEmitter.js
const EventEmitter = require("events");
const admin = require("firebase-admin");
const Notification = require("../models/notificationSchema");
const User = require("../models/userSchema");
const initFirebase = require("../utility/firebase");

class NotificationEmitter extends EventEmitter {}
const notificationEmitter = new NotificationEmitter();

notificationEmitter.on(
  "sendNotification",
  async ({ title, body, posted_by, data }) => {
    console.log("------ Notification Payload ------", {
      title,
      body,
      posted_by,
      data,
    });

    try {
      await initFirebase();

      // ✅ Fetch all users except the one who posted
      const users = await User.find({
        _id: { $ne: posted_by },
        fcm_token: { $exists: true, $ne: null },
      }).select("fcm_token");

      const tokens = users.map((u) => u.fcm_token).filter(Boolean);

      if (!tokens.length) {
        console.log("⚠️ No valid FCM tokens found for other users");
        return;
      }

      // ✅ Loop over tokens and send one by one
      for (const token of tokens) {
        try {
          const message = {
            notification: { title, body },
            data: data
              ? Object.fromEntries(
                  Object.entries(data).map(([k, v]) => [k, String(v)])
                )
              : {},
            token,
          };

          const response = await admin.messaging().send(message);

          // Log success
          await Notification.create({
            title,
            body,
            posted_by,
            token,
            data,
            status: "success",
          });

          console.log("📨 Sent to", token, ":", response);
        } catch (err) {
          // Log failure for this token
          await Notification.create({
            title,
            body,
            posted_by,
            token,
            data,
            status: "failed",
            error: err.message,
          });

          console.error("❌ Failed to send to", token, ":", err.message);
        }
      }
    } catch (error) {
      console.error("❌ Error sending notifications:", error);

      await Notification.create({
        title,
        body,
        posted_by,
        data,
        status: "failed",
        error: error.message,
      });
    }
  }
);

module.exports = notificationEmitter;
