const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');

const { updateProfile } = require('../controllers/careerController');

router.post('/profile', auth, updateProfile);

module.exports = router;


