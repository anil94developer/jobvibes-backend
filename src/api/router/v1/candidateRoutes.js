const {
  candidateStep1Controller,
} = require("../../controllers/candidateController");
const { authenticate } = require("../../middleware/authMiddleware");

router.post("/step-1", authenticate, candidateStep1Controller);
module.exports = router;
