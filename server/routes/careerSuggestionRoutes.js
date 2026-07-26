const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const { generateSuggestion } = require("../controllers/careerSuggestionController");

router.get("/generate", auth, generateSuggestion);

module.exports = router;