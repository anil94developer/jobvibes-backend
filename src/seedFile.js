// seedStatesAndCities.js

const mongoose = require("mongoose");
const { citiesByState } = require("./path-to-your-cities-file"); // 👈 adjust path
const State = require("./models/stateSchema");
const City = require("./models/citySchema");

// MongoDB connection string
const MONGODB_URI = "mongodb://127.0.0.1:27017/your_database_name"; // 👈 change this

(async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    // Optional: Clear existing data
    await State.deleteMany({});
    await City.deleteMany({});
    console.log("🧹 Cleared existing States and Cities");

    for (const [stateName, cities] of Object.entries(citiesByState)) {
      // 1️⃣ Create State
      const state = new State({ name: stateName });
      await state.save();
      console.log(`🌍 Inserted State: ${stateName}`);

      // 2️⃣ Create all cities for this state
      const cityDocs = cities.map((cityName) => ({
        name: cityName,
        state: state._id,
      }));

      await City.insertMany(cityDocs);
      console.log(`🏙️ Inserted ${cities.length} cities for ${stateName}`);
    }

    console.log("🎉 All states and cities have been successfully inserted!");

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    mongoose.connection.close();
  }
})();
