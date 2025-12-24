import { Schema, model, Document, Types } from 'mongoose';

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  category: Types.ObjectId;
  stock: number;
  imageUrl: string; // Новое поле
  isDeleted: boolean;
}

const productSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    stock: { type: Number, default: 0, min: 0 },
    // Картинка по умолчанию (красивый гаджет с Unsplash)
    imageUrl: { 
      type: String, 
      default: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800' 
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Product = model<IProduct>('Product', productSchema);