const express = require('express');
const User = require('../models/User');
const router = express.Router();
const isAuthenticated = require('../middlewares/isAuthenticated');

// Get user profile
router.get('/api/users/:userId', isAuthenticated, async (req, res) => {
	try {
		const user = await User.findById(req.params.userId);
		res.json(user);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// Update user profile
router.put('/api/users/:userId', isAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;
        const { username, email } = req.body;

        const updatedUser = await User.findByIdAndUpdate(userId, { username, email }, { new: true });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
