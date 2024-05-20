const express = require('express');
const passport = require('passport');
const User = require('../models/User');

const router = express.Router();

// Discord Authentication Routes
router.get('/auth/discord', passport.authenticate('discord'));
router.get('/auth/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/',
    successRedirect: '/'
}));

router.get('/auth/status', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ user: req.user });
    } else {
        res.status(401).json({ user: null });
    }
});

router.get('/auth/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;
