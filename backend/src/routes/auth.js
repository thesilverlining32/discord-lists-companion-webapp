const router = require('express').Router();
const passport = require('passport');

router.get('/discord', passport.authenticate('discord'));

router.get('/discord/callback', (req, res, next) => {
    console.log('Discord callback hit');
    next();
}, passport.authenticate('discord', {
    failureRedirect: '/'
}), (req, res) => {
    console.log('Discord authentication successful');
    res.redirect('https://discord-app.ggior32.dev/dashboard');
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;
