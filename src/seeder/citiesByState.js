const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const cityFilePath = path.join(__dirname, "city.json");

let citiesByState = {};
try {
  const fileData = fs.readFileSync(cityFilePath, "utf-8");
  citiesByState = JSON.parse(fileData);
  console.log("✅ Loaded city.json successfully");
} catch (err) {
  console.error("❌ Error reading or parsing city.json:", err.message);
  process.exit(1);
}
const stateSchema = new mongoose.Schema(
  { name: { type: String, required: true, unique: true, trim: true } },
  { timestamps: true }
);
const State = mongoose.model("State", stateSchema);

const citySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
      required: true,
    },
  },
  { timestamps: true }
);
const City = mongoose.model("City", citySchema);

const MONGODB_URI =
  "mongodb+srv://megha:bhansali2911@cluster0.qs3zejn.mongodb.net/job_vibe?retryWrites=true&w=majority";

async function seedDatabase() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // await State.deleteMany({});
    // await City.deleteMany({});
    // console.log("🧹 Cleared old data");

    for (const [stateName, cities] of Object.entries(citiesByState)) {
      if (!Array.isArray(cities)) {
        console.warn(`⚠️ Skipping "${stateName}" — cities data is invalid`);
        continue;
      }

      const state = await State.create({ name: String(stateName).trim() });

      const cityDocs = cities.map((city) => ({
        name: String(city).trim(),
        state: state._id,
      }));

      await City.insertMany(cityDocs);
      console.log(`🌍 ${stateName} → ${cities.length} cities added`);
    }

    console.log("🎉 All states and cities inserted successfully!");
  } catch (err) {
    console.error("❌ Error inserting data:", err);
  } finally {
    await mongoose.connection.close();
    console.log("🔒 MongoDB connection closed");
  }
}

seedDatabase();
