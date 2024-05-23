const express = require('express');
const List = require('../models/List');
const ListItem = require('../models/ListItem');
const isAuthenticated = require('../middlewares/isAuthenticated');

const router = express.Router();

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

// Update list
router.put('/api/lists/:listId', isAuthenticated, (req, res) => {
    List.findByIdAndUpdate(req.params.listId, { name: req.body.name }, { new: true })
        .then(list => res.json(list))
        .catch(err => res.status(500).json(err));
});

// Delete list if it is empty
router.delete('/api/lists/:listId', isAuthenticated, async (req, res) => {
    try {
        const list = await List.findById(req.params.listId).populate('items');
        if (list.items.length === 0) {
            await List.findByIdAndDelete(req.params.listId);
            res.json({ message: 'List deleted successfully' });
        } else {
            res.status(400).json({ error: 'List is not empty' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new list item
router.post('/api/lists/:listId/items', isAuthenticated, (req, res) => {
    const newItem = new ListItem({
        content: req.body.content,
        description: req.body.description,
        category: req.body.category,
        list: req.params.listId,
        createdBy: req.user._id,
        metadata: req.body.metadata,  // Add this line to handle metadata
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
