const express = require('express');
const passport = require('passport');
const router = express.Router();

// Authentication routes
router.get('/auth/discord', passport.authenticate('discord'));

router.get(
    '/auth/discord/callback',
    passport.authenticate('discord', {
        failureRedirect: '/',
        successRedirect: '/',
    })
);

router.get('/auth/status', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ user: req.user });
    } else {
        res.json({ user: null });
    }
});

router.get('/auth/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
});

module.exports = router;
