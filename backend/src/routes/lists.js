const router = require('express').Router();
const List = require('../models/List');
const Item = require('../models/Item');

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
}

// Routes for lists
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const lists = await List.find({ userId: req.user.id });
        res.json(lists);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', isAuthenticated, async (req, res) => {
    try {
        const newList = new List({
            name: req.body.name,
            userId: req.user.id
        });
        const list = await newList.save();
        res.json(list);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const list = await List.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
        res.json(list);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        await List.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Routes for items
router.get('/:listId/items', isAuthenticated, async (req, res) => {
    try {
        const items = await Item.find({ listId: req.params.listId });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/:listId/items', isAuthenticated, async (req, res) => {
    try {
        const newItem = new Item({
            title: req.body.title,
            description: req.body.description,
            rating: req.body.rating,
            imageUrl: req.body.imageUrl,
            listId: req.params.listId,
            userId: req.user.id
        });
        const item = await newItem.save();
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/:listId/items/:itemId', isAuthenticated, async (req, res) => {
    try {
        const item = await Item.findByIdAndUpdate(req.params.itemId, {
            title: req.body.title,
            description: req.body.description,
            rating: req.body.rating,
            imageUrl: req.body.imageUrl
        }, { new: true });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:listId/items/:itemId', isAuthenticated, async (req, res) => {
    try {
        await Item.findByIdAndDelete(req.params.itemId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
