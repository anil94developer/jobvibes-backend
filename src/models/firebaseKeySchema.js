const mongoose = require("mongoose");

const firebaseKeySchema = new mongoose.Schema({
  data: {
    type: mongoose.Schema.Types.Mixed, // can hold any type of JSON
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const FirebaseKey = mongoose.model("FirebaseKey", firebaseKeySchema);

module.exports = FirebaseKey;
