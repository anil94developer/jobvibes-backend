const mongoose = require("mongoose");
const JobTitle = require("./models/jobTitleSchema");
const jobTitles = require("./seeder/jobTitlesSeed");

require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to DB");

    await JobTitle.deleteMany({});
    console.log("Old job titles removed");

    await JobTitle.insertMany(jobTitles);
    console.log("Job titles seeded successfully!");

    process.exit();
  })
  .catch((err) => {
    console.error("Error connecting to DB:", err);
    process.exit(1);
  });
