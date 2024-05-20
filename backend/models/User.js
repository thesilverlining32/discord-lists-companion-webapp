const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    discordId: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    avatar: { type: String, required: true }, // Add the avatar field
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
