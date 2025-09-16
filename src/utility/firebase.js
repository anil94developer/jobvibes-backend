// utils/firebaseLoader.js
const admin = require("firebase-admin");
const FirebaseKey = require("../models/firebaseKeySchema");

let firebaseApp = null;

async function initFirebase() {
  if (firebaseApp) {
    return firebaseApp; // already initialized
  }

  // Fetch key from DB (you can use projectId if multiple projects)
  const firebaseKey = await FirebaseKey.findOne({});

  if (!firebaseKey || !firebaseKey.data) {
    throw new Error("Firebase service account key not found in DB");
  }

  // Initialize Firebase Admin
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: firebaseKey.data.project_id,
      clientEmail: firebaseKey.data.client_email,
      privateKey: firebaseKey.data.private_key, // important for formatting
    }),
  });

  console.log("✅ Firebase Admin initialized from DB");

  return firebaseApp;
}

module.exports = initFirebase;
