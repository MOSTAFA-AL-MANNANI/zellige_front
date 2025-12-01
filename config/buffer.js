const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");

const app = express();

// ------------------------------
// 🔹 Schema Produit
// ------------------------------
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  prix: Number,
  stock: Number,
  category: String,
  image: { data: Buffer, contentType: String }, // 🖼️ تخزين الصورة كـ buffer
});

const Product = mongoose.model("Product", productSchema);

// ------------------------------
// 🔹 Multer - stockage في الذاكرة
// ------------------------------
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // الحد الأقصى 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const ext = file.originalname.toLowerCase();
    if (allowedTypes.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error("فقط الصور JPG, JPEG, PNG مسموحة"));
    }
  },
});