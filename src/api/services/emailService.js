require("dotenv").config();

const nodemailer = require("nodemailer");
const fs = require("fs-extra");
const path = require("path");
const handlebars = require("handlebars");

// Load email credentials from environment variables
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error("❌ EMAIL_USER and EMAIL_PASS must be set in .env");
} else {
  console.log("✅ Email service credentials loaded.");
}

// Create transporter (use host/port for flexibility instead of service)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for 465, false for 587
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
    // Ensure .hbs extension
    if (!templateName.endsWith(".hbs")) {
      templateName += ".hbs";
    }

    // Use absolute path from project root
    const templateFullPath = path.resolve(
      __dirname,
      "../../templates",
      templateName
    );

    // Read and compile template
    const templateContent = await fs.readFile(templateFullPath, "utf8");
    const template = handlebars.compile(templateContent);

    // Generate HTML
    const html = template(data);

    // Prepare mail options
    const mailOptions = {
      from: `"JobVibes" <${EMAIL_USER}>`,
      to: email,
      subject: data.subject || "Notification",
      html,
    };

    console.log("📧 Sending email with data:", mailOptions);

    // Send email
    await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent successfully to ${email} using ${templateName}`);
    return { status: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("❌ sendEmail error:", error);
    return { status: false, message: error.message, error };
  }
}

module.exports = { sendEmail };
