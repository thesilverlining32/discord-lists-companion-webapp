const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const authRoutes = require('./routes/auth');
const listRoutes = require('./routes/lists');
require('./config/passport');

const app = express();
app.use(express.json());

// Use environment variable for MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/my-list-app';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to the MongoDB database');
});

// Session setup
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(authRoutes);
app.use(listRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
