const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
  generateSuggestion,
  getHistory,
} = require("../controllers/careerSuggestionController");

router.get("/generate", auth, generateSuggestion);

router.get("/history", auth, getHistory);

module.exports = router;