const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const fs = require("fs-extra");
const path = require("path");
const handlebars = require("handlebars");

// admin.initializeApp();

// Configure your Gmail or SMTP transporter
// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: functions.config().email.user, // set via Firebase config
//     pass: functions.config().email.pass,
//   },
// });

/**
 * sendEmail - Reusable function
 * @param {String} email
 * @param {String} templatePath
 * @param {Object} data
 */
exports.sendEmail = async (email, templatePath, data = {}) => {
  try {
    const templateContent = await fs.readFile(
      path.resolve(templatePath),
      "utf8"
    );
    const template = handlebars.compile(templateContent);
    const html = template(data);

    await transporter.sendMail({
      from: functions.config().email.user,
      to: email,
      subject: data.subject || "Notification",
      html,
    });

    return { status: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("sendEmail error:", error);
    return { status: false, message: error.message };
  }
};

// Firebase Callable Function
exports.sendEmailFunction = functions.https.onCall(async (data, context) => {
  const { email, templatePath, templateData } = data;

  if (!email || !templatePath) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Email and templatePath are required."
    );
  }

  const result = await sendEmail(email, templatePath, templateData);
  return result;
});
