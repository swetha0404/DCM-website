import dotenv from 'dotenv';
dotenv.config();

import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { S3Client } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Handles detection result uploads with suffix "_result"
export const uploadToS3 = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: 'public-read',
    key: (req, file, cb) => {
      try {
        const ext = path.extname(file.originalname); // .jpg or .png
        const username = req.user?.username || 'anon';

        // Allow both req.query and req.body for flexibility
        const baseImageName = req.body.imageName || req.query.imageName || 'unnamed';
        
        const isDetectionResult = req.originalUrl.includes("/image/detect"); // route check

        const filename = isDetectionResult
          ? `${username}_${baseImageName}_result${ext}`
          : `${username}_${baseImageName}${ext}`;

        console.log("📦 Final filename sent to S3:", filename);

        cb(null, filename);
      } catch (err) {
        console.error("❌ Error generating filename for S3:", err);
        cb(err);
      }
    },
  }),
});

export { s3 };
