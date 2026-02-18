const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ===============================
   MIDDLEWARE (VERY IMPORTANT)
================================ */
app.use(
  cors({
    origin: "*", // allow all origins (frontend, Netlify, localhost)
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
  })
);

app.use(express.json());

// Handle preflight requests
app.options("*", cors());

/* ===============================
   MONGODB CONNECTION
================================ */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

/* ===============================
   SCHEMA & MODEL
================================ */
const ContactSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    phone: String,
    message: String
  },
  { timestamps: true }
);

const Contact = mongoose.model("Contact", ContactSchema);

/* ===============================
   TEST ROUTE
================================ */
app.get("/", (req, res) => {
  res.send("Backend is running successfully");
});

/* ===============================
   CONTACT FORM API
================================ */
app.post("/contact", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    await Contact.create({ name, email, phone, message });

    res.json({
      success: true,
      message: "Message saved successfully"
    });

  } catch (err) {
    console.error("❌ Contact API Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

/* ===============================
   ADMIN LOGIN API
================================ */
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "admin123") {
    return res.json({ success: true });
  }

  res.status(401).json({
    success: false,
    message: "Invalid credentials"
  });
});

/* ===============================
   ADMIN DASHBOARD APIs
================================ */
app.get("/admin/contacts", async (req, res) => {
  const data = await Contact.find().sort({ createdAt: -1 });
  res.json({ success: true, data });
});

app.delete("/admin/contact/:id", async (req, res) => {
  await Contact.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

/* ===============================
   START SERVER
================================ */
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
