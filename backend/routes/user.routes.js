import express from "express";
import {
  registerUser,
  loginUser,
  uploadImage,
  updateAccount,
  getAllUsers,
  getImages,
  updateImageName,
  updateImageFile,
  deleteImage,
  uploadDetectionResult
} from "../controllers/user.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { uploadToS3 } from '../middleware/s3Upload.middleware.js';

const router = express.Router();
router.get("/all", protect, getAllUsers);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/update", protect, updateAccount);

router.post("/upload-image", protect, uploadToS3.single('image'), uploadImage);
router.post("/image/detect", protect, uploadToS3.single("result"), uploadDetectionResult);
router.get("/images", protect, getImages);
router.put("/image/update-name", protect, updateImageName);
router.put("/image/update-file", protect, uploadToS3.single('image'), updateImageFile);
router.delete("/image/:imageName", protect, deleteImage);

export default router;
