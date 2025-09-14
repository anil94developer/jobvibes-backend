const express = require("express");
const app = express();
const cors = require("cors");
const router = require("./src/api/router");
const path = require("path");
require("dotenv").config();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Connect to MongoDB database
require("./src/connections/mongodb");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Parse JSON bodies in incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up routes for related API endpoints
app.use("/api", router);

// Define the port the server will listen on
const PORT = process.env.NODE_PORT || process.env.PORT || 3000;

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
