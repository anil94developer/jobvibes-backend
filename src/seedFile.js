// seeder/stateCitySeeder.js
const mongoose = require("mongoose");
const State = require("../src/models/stateSchema");
const City = require("../src/models/citySchema");
const { citiesByState } = require("./seeder/citiesByState");

require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to DB");

    // Clear old data
    await State.deleteMany({});
    await City.deleteMany({});
    console.log("Old states and cities removed");

    // Insert states and cities
    for (const [stateName, cities] of Object.entries(citiesByState)) {
      const state = await State.create({ name: stateName });

      const cityDocs = cities.map((city) => ({
        name: city,
        state: state._id,
      }));

      await City.insertMany(cityDocs);
      console.log(`Inserted ${cities.length} cities for ${stateName}`);
    }

    console.log("Seeding completed!");
    process.exit();
  })
  .catch((err) => {
    console.error("Error connecting to DB:", err);
    process.exit(1);
  });
