const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const listRoutes = require('./routes/lists');
require('./config/passport');

const app = express();
app.use(express.json());

// Use morgan to log HTTP requests
app.use(morgan('dev'));

// Enable CORS for all routes
app.use(cors());

// MongoDB Connection
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

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Register API routes before the catch-all route
app.use(authRoutes);
app.use(listRoutes);

// Add a catch-all route for serving the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack); // Log the error stack
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
