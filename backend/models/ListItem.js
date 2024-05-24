const mongoose = require('mongoose');

const ListItemSchema = new mongoose.Schema({
    content: String,
    description: String,
    category: { type: String, required: true },
    list: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'List',
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    metadata: {
        title: String,
        description: String,
        imageUrl: String,
    },
});

module.exports = mongoose.model('ListItem', ListItemSchema);
