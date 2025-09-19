require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const router = require("./src/api/router");
const path = require("path");
const mongoose = require("mongoose");

// Models
const State = require("./src/models/stateSchema");
const City = require("./src/models/citySchema");

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Connect to MongoDB database
require("./src/connections/mongodb");

app.use("/uploads", express.static(path.resolve("src/uploads")));

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
