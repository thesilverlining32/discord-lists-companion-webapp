const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.REDIRECT_URI,
    scope: ['identify', 'email', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
    console.log('Discord profile:', profile); // Log Discord profile
    User.findOneAndUpdate({ discordId: profile.id }, {
        discordId: profile.id,
        username: profile.username,
        discriminator: profile.discriminator,
        avatar: profile.avatar,
        email: profile.email
    }, { upsert: true, new: true }, (err, user) => {
        if (err) {
            console.error('Error finding/updating user:', err); // Log error
            return done(err);
        }
        return done(null, user);
    });
}));
