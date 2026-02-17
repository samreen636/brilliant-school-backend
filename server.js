require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8081;

// ===============================
// Middleware (ORDER IS IMPORTANT)
// ===============================
app.use(cors());
app.use(express.json());               // ✅ must be before routes
app.use(express.urlencoded({ extended: true }));

// ===============================
// Admin Credentials
// ===============================
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

// ===============================
// MongoDB Connection
// ===============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// ===============================
// Contact Schema & Model
// ===============================
const contactSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    message: String,
  },
  { timestamps: true }
);

const Contact = mongoose.model("Contact", contactSchema);

// ===============================
// Test Route
// ===============================
app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

// ===============================
// PUBLIC: Contact Form
// ===============================
app.post("/contact", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    const newContact = new Contact({ name, email, phone, message });
    await newContact.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// ===============================
// ADMIN LOGIN (FIXED + SAFE)
// ===============================
app.post("/admin/login", (req, res) => {
  console.log("📥 Login body:", req.body); // 🔍 debug log

  const username = req.body?.username;
  const password = req.body?.password;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing credentials",
    });
  }

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return res.json({
      success: true,
      message: "Login successful",
    });
  }

  res.status(401).json({
    success: false,
    message: "Invalid credentials",
  });
});

// ===============================
// ADMIN: Get contacts
// ===============================
app.get("/admin/contacts", async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 });
  res.json({ success: true, data: contacts });
});

// ===============================
// ADMIN: Delete contact
// ===============================
app.delete("/admin/contact/:id", async (req, res) => {
  await Contact.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ===============================
// Start Server
// ===============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
