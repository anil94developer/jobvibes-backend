const express = require("express");
const router = express.Router();

router.use("/", require("./apiRoutes"));
router.use("/v1/auth", require("./v1/authRoutes"));
router.use("/v1/user", require("./v1/userRoutes"));
router.use("/v1/feed", require("./v1/feedRoutes"));

module.exports = router;
