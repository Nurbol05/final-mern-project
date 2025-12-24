"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/seed.ts
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("./models/User"); // Укажите правильный путь к модели
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const seedAdmin = async () => {
    try {
        await mongoose_1.default.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mystore');
        const adminExists = await User_1.User.findOne({ role: 'ADMIN' });
        if (!adminExists) {
            const hashedPassword = await bcryptjs_1.default.hash('admin123', 10);
            await User_1.User.create({
                email: 'admin@test.com',
                password: hashedPassword,
                role: 'ADMIN',
            });
            console.log('✅ Админ успешно создан: admin@test.com / admin123');
        }
        else {
            console.log('ℹ️ Админ уже существует в базе.');
        }
        await mongoose_1.default.disconnect();
    }
    catch (error) {
        console.error('❌ Ошибка при сидировании:', error);
    }
};
seedAdmin();
