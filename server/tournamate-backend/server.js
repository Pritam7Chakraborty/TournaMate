require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
// Render will automatically assign a port to process.env.PORT
const PORT = process.env.PORT || 3000;

// --- Middleware ---
// In production, we will set CLIENT_URL in Render's environment variables.
// For now, '*' allows access from anywhere (useful for initial testing).
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);
app.use(express.json());

// --- Database Connection ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error: ", err));

// --- Health Check Route (Important for Render) ---
app.get("/", (req, res) => {
  res.send("TournaMate Backend is active! 🚀");
});

// --- Routes ---
app.use("/api/tournaments", require("./routes/tournaments"));
app.use("/api/auth", require("./routes/auth"));

// --- Server Start ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
