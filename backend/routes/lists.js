const express = require('express');
const List = require('../models/List');
const ListItem = require('../models/ListItem');

const router = express.Router();

router.post('/api/lists', (req, res) => {
    const newList = new List({
        name: req.body.name,
        createdBy: req.user._id,
    });
    newList.save().then(list => res.json(list));
});

router.post('/api/lists/:listId/items', (req, res) => {
    const newItem = new ListItem({
        content: req.body.content,
        list: req.params.listId,
    });
    newItem.save().then(item => {
        List.findById(req.params.listId).then(list => {
            list.items.push(item);
            list.save().then(() => res.json(item));
        });
    });
});

router.get('/api/lists', (req, res) => {
    List.find().populate('createdBy').populate('items').then(lists => res.json(lists));
});

module.exports = router;
