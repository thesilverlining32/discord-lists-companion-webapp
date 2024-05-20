const express = require('express');
const User = require('../models/User');

const router = express.Router();

const isAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	res.status(401).json({ error: 'Unauthorized' });
};

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
		const updatedUser = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true });
		res.json(updatedUser);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
