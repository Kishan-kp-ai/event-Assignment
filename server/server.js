const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const rsvpRoutes = require("./routes/rsvp");

const app = express();

/* ==================== CORS (RENDER SAFE – FINAL) ==================== */
app.use(
  cors({
    origin: true, // ✅ allow all origins dynamically
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Explicit preflight support
app.options("*", cors());

/* ==================== BODY PARSER ==================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ==================== DATABASE ==================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

/* ==================== ROUTES ==================== */
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/rsvp", rsvpRoutes);

/* ==================== HEALTH ==================== */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Event Platform API is running 🚀",
  });
});

/* ==================== ERROR HANDLER ==================== */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Server Error",
  });
});

/* ==================== SERVER ==================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
