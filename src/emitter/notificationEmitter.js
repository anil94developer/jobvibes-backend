// emitter/notificationEmitter.js
const EventEmitter = require("events");
const admin = require("firebase-admin");
const Notification = require("../models/notificationSchema");
const User = require("../models/userSchema");
const initFirebase = require("../utility/firebase");

class NotificationEmitter extends EventEmitter {}
const notificationEmitter = new NotificationEmitter();

/**
 * Helper: Build safe, anonymous messages
 */
function buildMessage(type) {
  switch (type) {
    case "feed":
      return {
        title: "New post available",
        body: "Check out the latest update in your feed",
      };
    case "rating":
      return {
        title: "You have a new rating",
        body: "Someone interacted with your post",
      };
    case "application":
      return {
        title: "New application received",
        body: "You have a new application for your post",
      };
    case "reaction":
      return {
        title: "New reaction received",
        body: "Someone reacted to your post",
      };
    default:
      return {
        title: "New notification",
        body: "Open the app to see details",
      };
  }
}

/**
 * 🔔 1. Send feed notification to ALL users except the one who posted
 */
notificationEmitter.on("sendFeedNotification", async ({ posted_by, data }) => {
  const { title, body } = buildMessage("feed");

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
});

/**
 * 🔔 2. Send rating notification to a SPECIFIC user
 */
notificationEmitter.on(
  "sendUserNotification",
  async ({ receiverId, posted_by, data }) => {
    const { title, body } = buildMessage("rating");

    console.log("------ Rating Notification Payload ------", {
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
