require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = 3000;

// --- Database Connection ---
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connnected successfully"))
  .catch((err) => console.error("MongoDB conncetion error: ", err));

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---
app.use('/api/tournaments', require('./routes/tournaments'));
app.use('/api/auth', require('./routes/auth'));

// --- Server Start ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
