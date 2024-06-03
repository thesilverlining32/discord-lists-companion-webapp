const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const User = require('../models/User'); // Assuming you have a User model

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL,
    scope: ['identify', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log("Access Token: ", accessToken);
        console.log("Refresh Token: ", refreshToken);
        console.log("Profile: ", profile);

        let user = await User.findOne({ discordId: profile.id });
        console.log("User found: ", user);

        if (user) {
            return done(null, user);
        } else {
            const newUser = new User({
                discordId: profile.id,
                username: profile.username,
                email: profile.email
            });
            user = await newUser.save();
            console.log("New user created: ", user);
            return done(null, user);
        }
    } catch (err) {
        console.error("Error during authentication: ", err);
        return done(err);
    }
}));
