const mongoose = require('mongoose');

const listItemSchema = new mongoose.Schema({
    content: { type: String, required: true },
    list: { type: mongoose.Schema.Types.ObjectId, ref: 'List' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Add this line
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ListItem', listItemSchema);
