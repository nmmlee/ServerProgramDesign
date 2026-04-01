// routes/ingredient.js
const express = require('express');
const router = express.Router();
const Ingredient = require('../models/ingredient');

// CREATE
router.post('/', async (req, res) => {
    try {
        const ingredient = new Ingredient(req.body);
        await ingredient.save();
        res.status(201).json({
            id: ingredient._id,
            name: ingredient.name,
            quantity: ingredient.quantity,
            expiry: ingredient.expiry,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// READ
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        const ingredients = await Ingredient.find({ userId });

        res.json(
            ingredients.map((i) => ({
                id: i._id,
                name: i.name,
                quantity: i.quantity,
                expiry: i.expiry,
            })),
        );
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE
router.put('/:id', async (req, res) => {
    try {
        const updated = await Ingredient.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true },
        );

        res.json({
            id: updated._id,
            name: updated.name,
            quantity: updated.quantity,
            expiry: updated.expiry,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE
router.delete('/:id', async (req, res) => {
    try {
        await Ingredient.findByIdAndDelete(req.params.id);
        res.json({ message: '삭제 완료' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
