const mongoose = require("mongoose");

const URL = process.env.MONGO_URI || "mongodb://localhost:27017/jobvibes";

mongoose.set("strictQuery", false);

mongoose
  .connect(URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("---mongodb connection successfully---");
  })
  .catch((error) => {
    console.error("---DB Connection ERROR--", error);
  });

async function cleanup(signal) {
  try {
    await mongoose.connection.close();
    console.log(`Mongoose connection closed due to ${signal}`);
    process.exit(0);
  } catch (err) {
    console.error("Error closing Mongoose connection:", err);
    process.exit(1);
  }
}

process.on("SIGINT", () => cleanup("SIGINT"));
process.on("SIGTERM", () => cleanup("SIGTERM"));
process.on("exit", () => cleanup("exit"));
