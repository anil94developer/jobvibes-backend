require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const router = require("./src/api/router");

const app = express();

// Enable CORS
app.use(cors());

// MongoDB connection
const URL = process.env.MONGO_URI || "mongodb://localhost:27017/jobvibes";
mongoose.set("strictQuery", false);

async function connectDB() {
  try {
    await mongoose.connect(URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log("--- MongoDB connected successfully ---");
  } catch (err) {
    console.error("--- DB Connection ERROR ---", err.message);
    console.log("⏳ Retrying MongoDB connection in 5s...");
    setTimeout(connectDB, 5000);
  }
}
connectDB();

// Reconnect on disconnect/error
mongoose.connection.on("disconnected", () => {
  console.error("⚠️ MongoDB disconnected! Reconnecting...");
  setTimeout(connectDB, 5000);
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB error:", err.message);
  mongoose.disconnect(); // force reconnect cycle
});

// Serve static files
app.use("/uploads", express.static(path.resolve("src/uploads")));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", router);

// Start server
const PORT = process.env.NODE_PORT || process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
async function cleanup(signal) {
  console.log(`\nReceived ${signal}, closing server...`);
  try {
    await mongoose.connection.close();
    console.log("✅ Mongoose connection closed.");
    server.close(() => {
      console.log("✅ Express server closed.");
      process.exit(0); // Render or PM2/systemd will restart
    });
  } catch (err) {
    console.error("❌ Error during shutdown:", err);
    process.exit(1);
  }
}

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => cleanup(signal));
});

// Crash handlers (let Render/PM2 restart the app)
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
