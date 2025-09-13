const express = require("express");
const router = express.Router();

router.use("/", require("./apiRoutes"));
router.use("/v1/auth", require("./v1/authRoutes"));
// router.use("/v1/employer", require("./v1/employerRoutes"));
// router.use("/v1/candidate", require("./v1/candidateRoutes"));

module.exports = router;
