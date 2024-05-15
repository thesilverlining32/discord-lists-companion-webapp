const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema({
    name: String,
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ListItem' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('List', ListSchema);
