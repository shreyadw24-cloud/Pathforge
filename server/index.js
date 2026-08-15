const rateLimit = require("express-rate-limit");
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");

dotenv.config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const careerRoutes = require("./routes/careerRoutes");
const careerSuggestionRoutes = require("./routes/careerSuggestionRoutes");


//dotenv.config();

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(helmet());
app.use(express.json());

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/career", careerRoutes);
app.use("/api/suggestions", careerSuggestionRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("Hello from CareerAdvisor Backend!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});