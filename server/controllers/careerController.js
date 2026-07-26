const User = require('../models/User');

exports.updateProfile = async (req, res) => {
  try {
    const { skills, interests, background } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        skills,
        interests,
        background,
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
