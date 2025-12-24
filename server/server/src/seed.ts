// src/seed.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from './models/User'; // Укажите правильный путь к модели
import dotenv from 'dotenv';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/mystore');

    const adminExists = await User.findOne({ role: 'ADMIN' });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        email: 'admin@test.com',
        password: hashedPassword,
        role: 'ADMIN',
      });
      console.log('✅ Админ успешно создан: admin@test.com / admin123');
    } else {
      console.log('ℹ️ Админ уже существует в базе.');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Ошибка при сидировании:', error);
  }
};

seedAdmin();