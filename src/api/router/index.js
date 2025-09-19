const express = require("express");
const router = express.Router();

router.use("/v1/", require("./apiRoutes"));
router.use("/v1/auth", require("./v1/authRoutes"));
router.use("/v1/user", require("./v1/userRoutes"));
router.use("/v1/feed", require("./v1/feedRoutes"));
router.use("/v1/notification", require("./v1/notificationRoutes"));

module.exports = router;
