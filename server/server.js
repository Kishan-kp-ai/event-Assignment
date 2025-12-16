const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const rsvpRoutes = require("./routes/rsvp");

const app = express();

/* ==================== CORS (HARD FIX) ==================== */
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://event-assignment.vercel.app");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  // ✅ Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

/* ==================== BODY PARSER ==================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ==================== DATABASE ==================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

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
