const express = require('express');
const passport = require('passport');

const router = express.Router();

router.get('/auth/discord', passport.authenticate('discord'));

router.get('/auth/discord/callback', passport.authenticate('discord', {
    failureRedirect: '/'
}), (req, res) => {
    res.redirect('/');
});

router.get('/auth/logout', (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/');
    });
});

router.get('/auth/status', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ user: req.user });
    } else {
        res.json({ user: null });
    }
});

module.exports = router;
