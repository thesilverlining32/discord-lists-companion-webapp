const mongoose = require('mongoose');

const ListItemSchema = new mongoose.Schema({
    content: String,
    list: { type: mongoose.Schema.Types.ObjectId, ref: 'List' },
});

module.exports = mongoose.model('ListItem', ListItemSchema);
