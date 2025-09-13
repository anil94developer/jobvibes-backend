const admin = require("firebase-admin");
const serviceAccount = require("./job-vibes-3c48b-firebase-adminsdk-fbsvc-3ead25c9fa.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
