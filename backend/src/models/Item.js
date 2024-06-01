const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    rating: Number,
    imageUrl: String,
    listId: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Item', ItemSchema);
