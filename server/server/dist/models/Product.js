"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category', required: true },
    stock: { type: Number, default: 0, min: 0 },
    // Картинка по умолчанию (красивый гаджет с Unsplash)
    imageUrl: {
        type: String,
        default: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'
    },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
exports.Product = (0, mongoose_1.model)('Product', productSchema);
