// emitter/notificationEmitter.js
const EventEmitter = require("events");
const admin = require("firebase-admin");
const Notification = require("../models/notificationSchema");
const initFirebase = require("../utility/firebase");

class NotificationEmitter extends EventEmitter {}
const notificationEmitter = new NotificationEmitter();

notificationEmitter.on(
  "sendNotification",
  async ({ title, body, token, topic, posted_by, data }) => {
    console.log(`------ ~ { title, body, token, topic, data }:------`, {
      title,
      body,
      token,
      topic,
      posted_by,
      data,
    });
    try {
      await initFirebase();

      let message = {
        notification: { title, body },
      };

      // ✅ Ensure only one of token or topic is used
      if (token) {
        message.token = token;
      } else if (topic) {
        message.topic = topic;
      } else if (data) {
        message.data = JSON.stringify(data);
      } else {
        throw new Error("Either token or topic is required");
      }

      // Send notification
      const response = await admin.messaging().send(message);

      await Notification.create({
        title,
        body,
        posted_by,
        token,
        topic,
        data,
        status: "success",
      });

      console.log("📨 Notification sent:", response);
    } catch (error) {
      console.error("❌ Error sending notification:", error);

      await Notification.create({
        title,
        body,
        token,
        topic,
        data,
        status: "failed",
        error: error.message,
      });
    }
  }
);

module.exports = notificationEmitter;
