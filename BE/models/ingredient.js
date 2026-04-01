const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true, // 재료명
        },
        quantity: {
            type: Number,
            default: 1, // 개수
        },
        expiry: {
            type: String,
            required: true, // 소비기한 (YYYY-MM-DD)
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true, // 소유 사용자
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Ingredient', ingredientSchema);
