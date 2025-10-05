const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp"); // for image compression
const router = express.Router();

const validatorResponse = require("../../../utility/joiValidator");
const {
  step1Controller,
  step2Controller,
  step3Controller,
  uploadController,
  skillsController,
  updateController,
  getProfileController,
  getFeedController,
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

// Multer instance with 1GB limit
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1 GB
});

// Middleware to compress images > 1GB
const compressIfLarge = async (req, res, next) => {
  if (!req.files) return next();

  await Promise.all(
    req.files.map(async (file) => {
      if (file.size > 1024 * 1024 * 1024) {
        const compressedPath = path.join(
          uploadDir,
          `compressed-${file.filename}`
        );
        try {
          await sharp(file.path)
            .jpeg({ quality: 70 }) // compress image to ~70% quality
            .toFile(compressedPath);

          // Remove original large file
          fs.unlinkSync(file.path);

          // Update file path to compressed one
          file.path = compressedPath;
          file.filename = `compressed-${file.filename}`;
          file.size = fs.statSync(compressedPath).size;
        } catch (err) {
          console.error("Compression error:", err);
        }
      }
    })
  );

  next();
};

// Routes
router.post("/step-1", authenticate, step1Controller);
router.post("/step-2", authenticate, step2Controller);
router.post("/step-3", authenticate, step3Controller);

router.get("/skills", authenticate, skillsController);

router.post("/update", authenticate, updateController);

router.post(
  "/upload",
  authenticate,
  upload.array("files", 5),
  compressIfLarge, // compression middleware
  uploadController
);

// Get user details by id
router.get("/:id", authenticate, getProfileController);

router.get("/:userId/post", authenticate, getFeedController);

module.exports = router;
