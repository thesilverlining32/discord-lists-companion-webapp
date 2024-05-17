const express = require('express');
const List = require('../models/List');
const ListItem = require('../models/ListItem');

const router = express.Router();

router.post('/api/lists', (req, res) => {
    console.log('Request to create list:', req.body); // Log the request body
    const newList = new List({
        name: req.body.name,
        createdBy: req.user ? req.user._id : 'anonymous', // Ensure createdBy is set
    });
    newList.save()
        .then(list => {
            console.log('List created:', list); // Log the created list
            res.json(list);
        })
        .catch(err => {
            console.error('Error creating list:', err); // Log the error
            res.status(500).json(err);
        });
});

router.get('/api/lists', (req, res) => {
    List.find().populate('items').then(lists => res.json(lists)).catch(err => res.status(500).json(err));
});

router.post('/api/lists/:listId/items', (req, res) => {
    console.log('Request to create item:', req.body); // Log the request body
    const newItem = new ListItem({
        content: req.body.content,
        list: req.params.listId,
        createdBy: req.user ? req.user._id : 'anonymous', // Ensure createdBy is set
    });
    newItem.save()
        .then(item => {
            List.findById(req.params.listId).then(list => {
                list.items.push(item);
                list.save().then(() => res.json(item));
            });
        }).catch(err => {
            console.error('Error creating item:', err); // Log the error
            res.status(500).json(err);
        });
});

router.get('/api/lists/:listId/items', (req, res) => {
    ListItem.find({ list: req.params.listId }).then(items => res.json(items)).catch(err => res.status(500).json(err));
});

module.exports = router;
