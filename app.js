require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const router = require("./src/api/router");

const app = express();

// Enable CORS
app.use(cors());

// Connect to MongoDB
const URL = process.env.MONGO_URI || "mongodb://localhost:27017/jobvibes";
mongoose.set("strictQuery", false);

function connectDB() {
  mongoose
    .connect(URL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
    .then(() => console.log("--- MongoDB connected successfully ---"))
    .catch((err) => {
      console.error("--- DB Connection ERROR ---", err);
      // Try reconnecting in 5s
      setTimeout(connectDB, 5000);
    });
}
connectDB();

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
      process.exit(0); // process manager (PM2/systemd) will restart
    });
  } catch (err) {
    console.error("❌ Error during shutdown:", err);
    process.exit(1);
  }
}

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => cleanup(signal));
});
