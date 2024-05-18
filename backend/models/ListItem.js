const mongoose = require('mongoose');

const ListItemSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    list: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'List',
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, { timestamps: true });

module.exports = mongoose.model('ListItem', ListItemSchema);
