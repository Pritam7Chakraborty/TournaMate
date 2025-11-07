// server.js
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

dotenv.config();
const app = express();

// ---------- CONFIG ----------
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// Allowed frontend origins
const allowedOrigins = [
  "https://tournamate-frontend.vercel.app", // deployed frontend
  "http://localhost:5173"                   // dev frontend
];

// ---------- MIDDLEWARE ----------
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// ---------- DATABASE ----------
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ---------- ROUTES ----------
app.get("/", (req, res) => {
  res.send("TournaMate Backend is Active 🚀");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Example routes (replace with your real ones)
import authRoutes from "./routes/auth.js";
import tournamentRoutes from "./routes/tournaments.js";
app.use("/api/auth", authRoutes);
app.use("/api/tournaments", tournamentRoutes);

// ---------- SERVER ----------
app.listen(PORT, () => console.log(`🟢 Server running on port ${PORT}`));
