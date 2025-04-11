# DCM-website

## 🔍 Object Detection Dashboard — Fullstack MERN App

A fullstack web application built with the MERN stack to allow authenticated users to upload images and run **real-time object detection** directly in the browser. The website mimics core my work done during an internship at **DCM Datalabs**, demonstrating hands-on experience in authentication, file handling, S3 storage, and computer vision with TensorFlow.js.

---

## ⚙️ Features

- 🔐 Secure Authentication: Register/Login using JWT and Bcrypt with full middleware protection
- 🧑‍💼 User Profiles: Each user can upload and manage multiple images
- 📤 Upload Images to AWS S3 with public access URLs
- ✏️ Image Management: Rename, replace, or delete images directly from the dashboard
- 🧠 Object Detection: Powered by TensorFlow.js COCO-SSD, runs entirely in the browser (no backend inference)
- 🖼️ Detection UI: View original and result images side-by-side with bounding boxes
- 💾 Save Detection Results: Automatically store result image and object count in MongoDB and AWS S3
- 🔁 Re-run Detection: Previously detected images can be reprocessed
- ☁️ Fully Integrated with AWS S3: Original and result images are managed in cloud storage
- 🧩 Smart MongoDB Schema: Keeps track of detection metadata, result image URL, and count
- 🌐 Modern Tech Stack: Built using React, Express, MongoDB, and styled with Chakra UI
---

## 📁 Project Folder Structure

```plaintext
DCM Website/
├── backend/             # Express server, MongoDB models, routes
|    └── .env            # Environment variables (in backend)
├── frontend/            # React app with Chakra UI and TensorFlow
├── package.json         # Combined dev command
└── README.md
```


## 🛠️ Prerequisites
#### 1. Create a cluster on MongoDB website for storing database
#### 2. Create a bucket on AWS S3 website for storing images with ACL public access

## 🛠️ Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/swetha0404/DCM-website.git
cd DCM-website
```

### 2. Install dependencies (frontend + backend)

```bash
npm run install
```


### 3. Configure your environment

Create a `.env` file **inside the `backend/` folder** with the following keys:

```
VITE_API_BASE_URL = http://localhost:5000/api
MONGO_URI=<your_mongodb_connection_string>
PORT=<your_port_number>
JWT_SECRET=<your_custom_secret>
AWS_ACCESS_KEY_ID=<your_aws_access_key>
AWS_SECRET_ACCESS_KEY=<your_aws_secret_key>
AWS_REGION=<your_aws_region>
AWS_S3_BUCKET=<your_bucket_name>
```
> ⚠️ Make sure your S3 bucket has CORS enabled with `"Access-Control-Allow-Origin": "*"`

## 🧪 Generate a JWT Secret token

You can generate a token for your JWT_SECRET key via Powershell:

```bash
$bytes = New-Object byte[] 64; (New-Object System.Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes); ($bytes | ForEach-Object { $_.ToString("x2") }) -join ""
```

Paste this key into your `.env` file as `JWT_SECRET`.

---

### 4. Run the app in development

```bash
npm run dev
```
Frontend: [http://localhost:5173](http://localhost:5173)  
Backend API: [http://localhost:5000](http://localhost:5000)

---


## 💡

Made by Swetha Elayavalli to replicate object detection work done at DCM Datalabs.
