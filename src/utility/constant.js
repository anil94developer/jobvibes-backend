const dotenv = require("dotenv").config({ path: ".env" });

const CONSTANT = {
    DB_URL: process.env.MONGO_URI,
    NODE_PORT: process.env.NODE_PORT,
    BASE_URL: process.env.BASE_URL,
}


module.exports = CONSTANT;