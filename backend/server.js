const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const authRoutes = require('./routes/auth');
const listRoutes = require('./routes/lists');
require('./config/passport');

const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/discord-lists-companion-webapp', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(session({
    secret: 'your secret',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(authRoutes);
app.use(listRoutes);

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
