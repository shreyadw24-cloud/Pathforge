const User = require('../models/User');

exports.updateProfile = async (req, res) => {
  try {
    const { skills, interests, background, currentRole } = req.body;

    if (
      (skills && !Array.isArray(skills)) ||
      (interests && !Array.isArray(interests))
    ) {
      return res.status(400).json({ message: "skills and interests must be arrays" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        skills,
        interests,
        background,
        currentRole,
      },
      { new: true }
    );

    res.json(user);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
