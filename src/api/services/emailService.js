require("dotenv").config();

const nodemailer = require("nodemailer");
const fs = require("fs-extra");
const path = require("path");
const handlebars = require("handlebars");

// Load email credentials from environment variables
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  throw new Error(
    "Please set EMAIL_USER and EMAIL_PASS environment variables."
  );
}

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

/**
 * Sends an email using a Handlebars template
 * @param {string} email - Recipient email
 * @param {string} templateName - Template filename in templates folder
 * @param {object} data - Variables to inject into template
 */
async function sendEmail(email, templateName, data = {}) {
  try {
    // Automatically append .hbs if missing
    if (!templateName.endsWith(".hbs")) {
      templateName += ".hbs";
    }

    // Construct full path to template relative to this file
    const templateFullPath = path.join(
      __dirname,
      "../../templates",
      templateName
    );

    // Read and compile the template
    const templateContent = await fs.readFile(templateFullPath, "utf8");
    const template = handlebars.compile(templateContent);

    // Inject variables from data
    const html = template(data);
    console.log("------ ~ sendEmail ~ html:------", html);

    console.log("Data", {
      from: EMAIL_USER,
      to: email,
      subject: data.subject || "Notification",
      html,
    });
    // Send the email
    await transporter.sendMail({
      from: EMAIL_USER,
      to: email,
      subject: data.subject || "Notification",
      html,
    });

    console.log(
      `Email sent successfully to ${email} using template ${templateName}`
    );
    return { status: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("sendEmail error:", error);
    return { status: false, message: error.message };
  }
}

module.exports = { sendEmail };
