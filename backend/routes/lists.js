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

router.post('/api/lists', isAuthenticated, (req, res) => {
    console.log('Request to create list:', req.body);
    const newList = new List({
        name: req.body.name,
        createdBy: req.user._id,
    });
    newList.save()
        .then(list => {
            console.log('List created:', list);
            res.json(list);
        })
        .catch(err => {
            console.error('Error creating list:', err);
            res.status(500).json(err);
        });
});

router.get('/api/lists', (req, res) => {
    List.find().populate('items').then(lists => res.json(lists)).catch(err => res.status(500).json(err));
});

router.post('/api/lists/:listId/items', isAuthenticated, (req, res) => {
    console.log('Request to create item:', req.body);
    const newItem = new ListItem({
        content: req.body.content,
        list: req.params.listId,
        createdBy: req.user._id,
    });
    newItem.save()
        .then(item => {
            List.findById(req.params.listId).then(list => {
                list.items.push(item);
                list.save().then(() => res.json(item));
            });
        }).catch(err => {
            console.error('Error creating item:', err);
            res.status(500).json(err);
        });
});

router.get('/api/lists/:listId/items', (req, res) => {
    ListItem.find({ list: req.params.listId }).then(items => res.json(items)).catch(err => res.status(500).json(err));
});

// Update list item
router.put('/api/lists/:listId/items/:itemId', async (req, res) => {
    try {
        const { listId, itemId } = req.params;
        const updatedItem = await ListItem.findByIdAndUpdate(itemId, req.body, { new: true });
        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete list item
router.delete('/api/lists/:listId/items/:itemId', async (req, res) => {
    try {
        const { listId, itemId } = req.params;
        await ListItem.findByIdAndDelete(itemId);
        res.json({ message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
