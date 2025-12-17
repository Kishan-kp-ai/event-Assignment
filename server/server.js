const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const rsvpRoutes = require("./routes/rsvp");

const app = express();

/* ==================== CORS (FINAL FIX) ==================== */
const allowedOrigins = [
  "http://localhost:3000",
  "https://event-assignment-frontend-p06m.onrender.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server / Postman
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests
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

/* ==================== HEALTH CHECK ==================== */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Event Platform API is running 🚀",
  });
});

/* ==================== GLOBAL ERROR HANDLER ==================== */
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
