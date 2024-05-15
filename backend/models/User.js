const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    discordId: String,
    username: String,
});

module.exports = mongoose.model('User', UserSchema);
