const express = require('express');
const List = require('../models/List');
const ListItem = require('../models/ListItem');

const router = express.Router();

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
};

// Create a new list
router.post('/api/lists', isAuthenticated, (req, res) => {
    const newList = new List({
        name: req.body.name,
        createdBy: req.user._id,
    });
    newList.save()
        .then(list => res.json(list))
        .catch(err => res.status(500).json(err));
});

// Get all lists
router.get('/api/lists', isAuthenticated, (req, res) => {
    List.find({ createdBy: req.user._id }).populate('items')
        .then(lists => res.json(lists))
        .catch(err => res.status(500).json(err));
});

//Get a list items
router.get('/api/lists/:listId/items', isAuthenticated, (req, res) => {
    ListItem.find({ list: req.params.listId }).then(items => res.json(items)).catch(err => res.status(500).json(err));
});

// Create a new list item
router.post('/api/lists/:listId/items', isAuthenticated, (req, res) => {
    const newItem = new ListItem({
        content: req.body.content,
        description: req.body.description,
        list: req.params.listId,
        createdBy: req.user._id,
    });
    newItem.save()
        .then(item => {
            List.findById(req.params.listId).then(list => {
                list.items.push(item);
                list.save().then(() => res.json(item));
            });
        }).catch(err => res.status(500).json(err));
});

// Update list item
router.put('/api/lists/:listId/items/:itemId', isAuthenticated, async (req, res) => {
    try {
        const { listId, itemId } = req.params;
        const updatedItem = await ListItem.findByIdAndUpdate(itemId, req.body, { new: true });
        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete list item
router.delete('/api/lists/:listId/items/:itemId', isAuthenticated, async (req, res) => {
    try {
        const { listId, itemId } = req.params;
        await ListItem.findByIdAndDelete(itemId);
        res.json({ message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
