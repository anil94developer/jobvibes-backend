const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const validatorResponse = require("../../../utility/joiValidator");
const {
  step1Controller,
  step2Controller,
  step3Controller,
  uploadController,
  skillsController,
  updateController,
} = require("../../controllers/userController.js");
const { authenticate } = require("../../middleware/authMiddleware");
const {
  step1Schema,
} = require("../../validationSchema/userValidationSchema.js");

// Uploads folder path
const uploadDir = path.join(__dirname, "../../../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // save to uploads/ folder
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "_"); // replace spaces with underscores
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = multer({ storage });

router.post(
  "/step-1",
  authenticate,
  validatorResponse(step1Schema),
  step1Controller
);
router.post("/step-2", authenticate, step2Controller);
router.post("/step-3", authenticate, step3Controller);

router.get("/skills", authenticate, skillsController);

router.post("/update", authenticate, updateController);

router.post(
  "/upload",
  authenticate,
  upload.array("files", 5),
  uploadController
);

module.exports = router;
