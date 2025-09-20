// emitter/notificationEmitter.js
const EventEmitter = require("events");
const admin = require("firebase-admin");
const Notification = require("../models/notificationSchema");
const User = require("../models/userSchema");
const initFirebase = require("../utility/firebase");

class NotificationEmitter extends EventEmitter {}
const notificationEmitter = new NotificationEmitter();

/**
 * 🔔 1. Send feed notification to ALL users except the one who posted
 */
notificationEmitter.on(
  "sendFeedNotification",
  async ({ title, body, posted_by, data }) => {
    console.log("------ Feed Notification Payload ------", {
      title,
      body,
      posted_by,
      data,
    });

    try {
      await initFirebase();

      // Fetch all users except poster
      const users = await User.find({
        _id: { $ne: posted_by },
        fcm_token: { $exists: true, $ne: null },
      }).select("fcm_token");

      const tokens = users.map((u) => u.fcm_token).filter(Boolean);

      if (!tokens.length) {
        console.log("⚠️ No valid FCM tokens found for other users");
        return;
      }

      // Send one by one
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
      console.error("❌ Error sending feed notifications:", error);

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

/**
 * 🔔 2. Send notification to a SPECIFIC user
 */
notificationEmitter.on(
  "sendUserNotification",
  async ({ title, body, receiverId, data, posted_by }) => {
    console.log("------ User Notification Payload ------", {
      title,
      body,
      receiverId,
      posted_by,
      data,
    });

    try {
      await initFirebase();

      const user = await User.findById(receiverId).select("fcm_token");
      if (!user || !user.fcm_token) {
        console.log("⚠️ No valid FCM token for this user");
        return;
      }

      const message = {
        notification: { title, body },
        data: data
          ? Object.fromEntries(
              Object.entries(data).map(([k, v]) => [k, String(v)])
            )
          : {},
        token: user.fcm_token,
      };

      const response = await admin.messaging().send(message);

      await Notification.create({
        title,
        body,
        posted_by,
        token: user.fcm_token,
        receiverId,
        data,
        status: "success",
      });

      console.log("📨 Notification sent to specific user:", response);
    } catch (error) {
      console.error("❌ Error sending user notification:", error);

      await Notification.create({
        title,
        body,
        posted_by,
        receiverId,
        data,
        status: "failed",
        error: error.message,
      });
    }
  }
);

module.exports = notificationEmitter;
