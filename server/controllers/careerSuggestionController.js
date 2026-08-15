const User = require("../models/User");
const CareerSuggestion = require("../models/CareerSuggestion");
const { generateCareerAdvice } = require("../utils/aiClient");

exports.generateSuggestion = async (req, res) => {
  try {
    // Get logged-in user
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Validate profile
    if (
      !user.skills?.length ||
      !user.interests?.length ||
      !user.background
    ) {
      return res.status(400).json({
        message: "Please complete your profile first.",
      });
    }

    // Generate AI suggestions
    let suggestions;
    try {
      suggestions = await generateCareerAdvice({
        skills: user.skills,
        interests: user.interests,
        background: user.background,
        currentRole: user.currentRole,
      });
    } catch (aiErr) {
      console.error("AI service error:", aiErr);
      return res.status(502).json({ message: "AI service is currently unavailable. Please try again." });
    }

    // Save suggestions in MongoDB
    const careerSuggestion = await CareerSuggestion.create({
  userId: user._id,
  suggestions,

  skills: [...user.skills],
  interests: [...user.interests],
  background: user.background,
  currentRole: user.currentRole,
});

    // Return response
    res.status(200).json({
      message: "Career suggestions generated successfully.",
      suggestions: careerSuggestion.suggestions,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const history = await CareerSuggestion.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      history,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};