import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../middleware/s3Upload.middleware.js"; // export s3 client
// Generate JWT
const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Register
export const registerUser = async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
  
    // Check if all fields are filled
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "Please fill all fields" });
    }
  
    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
  
    // Check if user exists
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) return res.status(400).json({ message: "User already exists" });
  
    // Hash password and save
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });
  
    res.status(201).json({
      token: generateToken(user._id),
      user: { id: user._id, username: user.username, email: user.email }
    }); 
};
  
// Login
export const loginUser = async (req, res) => {
    const { identifier, password } = req.body;
  
    if (!identifier || !password) {
      return res.status(400).json({ message: "Please enter both identifier and password" });
    }
  
    // Case-insensitive search using regex
    const user = await User.findOne({
      $or: [
        { email: { $regex: new RegExp(`^${identifier}$`, 'i') } },
        { username: { $regex: new RegExp(`^${identifier}$`, 'i') } }
      ]
    });
  
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
  
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid password" });
    }
  
    res.json({
      token: generateToken(user._id),
      user: { id: user._id, username: user.username, email: user.email },
    });
};

// Update account details
export const updateAccount = async (req, res) => {
  const { currentPassword, email, username, newPassword, confirmPassword } = req.body;

  if (!currentPassword) {
    return res.status(400).json({ message: "Current password is required." });
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Incorrect current password." });
  }

  if (newPassword && newPassword !== confirmPassword) {
    return res.status(400).json({ message: "New passwords do not match." });
  }

  if (email) user.email = email;
  if (username) user.username = username;
  if (newPassword) user.password = await bcrypt.hash(newPassword, 10);

  await user.save();
  return res.status(200).json({ message: "Account updated successfully." });
};

export const getAllUsers = async (req, res) => {
  // if (!req.user || req.user.email !== "admin@example.com") {
  //     return res.status(403).json({ message: "Not authorized" });
  // }
  
  try {
    const users = await User.find({}); // exclude password
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: "Failed to retrieve users" });
  }
};

// upload image to s3
export const uploadImage = async (req, res) => {
  if (!req.file || !req.file.location) {
    console.error("❌ File uploaded to S3 but not returned in req.file");
    return res.status(400).json({ message: "Upload failed or invalid file" });
  }

  const user = await User.findById(req.user._id);
  const imageName = req.query.imageName?.trim();

  if (!imageName) {
    return res.status(400).json({ message: "Image name is required" });
  }

  // ✅ Duplicate name check
  const duplicate = user.images.find(
    (img) => img.name.toLowerCase() === imageName.toLowerCase()
  );
  if (duplicate) {
    return res.status(409).json({ message: "Duplicate image name found. Please choose a different name." });
  }

  const imageUrl = req.file.location;

  user.images.push({ name: imageName, url: imageUrl });
  await user.save();

  res.status(201).json({
    message: "Image uploaded to S3 successfully",
    name: imageName,
    url: imageUrl,
  });
};

export const uploadDetectionResult = async (req, res) => {
  try {
    const { imageName, count } = req.body;
    
    if (!imageName) {
      return res.status(400).json({ success: false, message: "Missing image name" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    console.log("All user images:", user.images.map(i => i.name));
    console.log("Searching for imageName:", imageName);

    const image = user.images.find((img) => img.name === imageName);
    if (!image) {
      return res.status(404).json({ success: false, message: "Original image not found" });
    }


    // ✅ Ensure result image was uploaded
    const { location, key } = req.file || {};
    if (!location) {
      return res.status(400).json({ success: false, message: "Detection result image missing" });
    }

    // ✅ Update result fields in MongoDB
    const resCount = parseInt(count || "0");

    image.res_url = location;
    image.res_count = resCount;

    await user.save();

    // ✅ Send clean and usable response
    return res.status(200).json({
      success: true,
      message: "Object detection result saved",
      res_url: location,
      res_key: key,
      res_count: resCount,
    });

  } catch (error) {
    console.error("❌ Error in uploadDetectionResult:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while saving detection result",
      error: error.message,
    });
  }
};

// Get all user images
export const getImages = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json(user.images);
};


export const updateImageName = async (req, res) => {
  const { oldName, newName } = req.body;
  const user = await User.findById(req.user._id);

  const image = user.images.find((img) => img.name === oldName);
  if (!image) return res.status(404).json({ success: false, message: "Image not found" });

  const trimmedNewName = newName?.trim();
  if (!trimmedNewName) {
    return res.status(400).json({ success: false, message: "New name is required" });
  }

  // ✅ Updated exact duplicate check (case-insensitive)
  const duplicate = user.images.find(
    (img) =>
      img.name.toLowerCase() === trimmedNewName.toLowerCase() &&
      img.name !== oldName
  );

  if (duplicate) {
    return res.status(409).json({
      success: false,
      message: "Duplicate image name found. Please choose a different name.",
    });
  }

  const username = req.user.username;

  try {
    const ext = image.url.split('.').pop().split('?')[0];
    const oldKey = `${username}_${oldName}.${ext}`;
    const newKey = `${username}_${trimmedNewName}.${ext}`;

    // Copy original image
    await s3.send(new CopyObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      CopySource: `${process.env.AWS_S3_BUCKET}/${oldKey}`,
      Key: newKey,
      ACL: "public-read",
    }));

    // Delete original image
    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: oldKey,
    }));

    // Handle result image rename (if it exists)
    if (image.res_url) {
      const resExt = image.res_url.split('.').pop().split('?')[0];
      const oldResKey = `${username}_${oldName}_result.${resExt}`;
      const newResKey = `${username}_${trimmedNewName}_result.${resExt}`;

      await s3.send(new CopyObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        CopySource: `${process.env.AWS_S3_BUCKET}/${oldResKey}`,
        Key: newResKey,
        ACL: "public-read",
      }));

      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: oldResKey,
      }));

      image.res_url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${newResKey}`;
    }

    // Update name and URL in DB
    image.name = trimmedNewName;
    image.url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${newKey}`;

    await user.save();
    res.json({ success: true, message: "Image and result renamed successfully" });
  } catch (err) {
    console.error("Rename error:", err);
    res.status(500).json({ success: false, message: "Failed to rename image(s) in S3" });
  }
};

// Replace image file: delete old, upload new, update metadata
export const updateImageFile = async (req, res) => {
  const imageName = req.query.imageName;
  const user = await User.findById(req.user._id);

  const image = user.images.find((img) => img.name === imageName);
  if (!image) return res.status(404).json({ message: "Image not found" });

  const oldKey = image.url.split("/").pop();

  try {
    // 1. Delete old image
    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: oldKey,
    }));

    // 2. Delete result image if it exists
    if (image.res_url) {
      const resKey = image.res_url.split("/").pop();
      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: resKey,
      }));
    }

    // 3. Save new image URL
    if (!req.file || !req.file.location) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    image.url = req.file.location;
    image.res_url = undefined;
    image.res_count = undefined;

    await user.save();

    res.status(200).json({ success: true, message: "Image file updated", image });
  } catch (error) {
    console.error("File update error:", error);
    res.status(500).json({ success: false, message: "Failed to update image file" });
  }
};


export const deleteImage = async (req, res) => {
  const { imageName } = req.params;
  const user = await User.findById(req.user._id);

  const imageIndex = user.images.findIndex((img) => img.name === imageName);
  if (imageIndex === -1) return res.status(404).json({ message: "Image not found" });

  const image = user.images[imageIndex];

  try {
    // 1. Delete original
    const fullKey = image.url.split("/").pop();
    await s3.send(new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fullKey
    }));

    // 2. Delete result if it exists
    if (image.res_url) {
      const resKey = image.res_url.split("/").pop();
      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: resKey
      }));
    }

    // 3. Remove from MongoDB
    user.images.splice(imageIndex, 1);
    await user.save();

    res.status(200).json({ success: true, message: "Image and result deleted" });
  } catch (err) {
    console.error("Deletion error:", err);
    res.status(500).json({ message: "Failed to delete image(s)" });
  }
};