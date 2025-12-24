import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../models/User';
import { Category } from '../../models/Category';
import { Product } from '../../models/Product';
import { Order } from '../../models/Order';
import EventEmitter from 'events';

const ee = new EventEmitter();
const ORDER_CREATED = 'ORDER_CREATED';

// Вспомогательная функция проверки авторизации
const checkAuth = (context: any) => {
  if (!context.userId) throw new Error('Необходима авторизация');
};

const checkAdmin = async (context: any) => {
  if (!context.userId) throw new Error('Необходима авторизация');
  
  const user = await User.findById(context.userId);
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Доступ запрещен: требуются права администратора');
  }
};

export const resolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      if (!context.userId) return null;
      return await User.findById(context.userId);
    },
    categories: async () => Category.find({ isDeleted: false }),
    products: async (_: any, args: any) => {
      const filter: any = { isDeleted: false };
      if (args.categoryId) filter.category = args.categoryId;
      return Product.find(filter).populate('category');
    },
    product: async (_: any, { id }: any) => {
        return Product.findById(id).populate('category');
    },
    orders: async (_: any, __: any, context: any) => {
      checkAuth(context);
      return Order.find({ user: context.userId }).populate('user').populate('items.product');
    },
    getProducts: async () => {
      return await Product.find({ isDeleted: false }).populate('category');
    },
  },

  Mutation: {
    register: async (_: any, args: any) => {
      const hashed = await bcrypt.hash(args.password, 10);
      // Заменяем на 'USER' (или 'ADMIN', если это регистрация админа)
      const user = await User.create({ email: args.email, password: hashed, role: 'USER' }); 
      return jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' }
      );

    },
    login: async (_: any, args: any) => {
      const user = await User.findOne({ email: args.email });
      if (!user) throw new Error('Пользователь не найден');
      const valid = await bcrypt.compare(args.password, user.password);
      if (!valid) throw new Error('Неверный пароль');
      return jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET as string,
        { expiresIn: '1h' }
      );

    },
    createCategory: async (_: any, args: any, context: any) => {
      await checkAdmin(context); // Проверка прав
      return Category.create(args);
    },
    createProduct: async (_: any, args: any, context: any) => {
      await checkAdmin(context);
      const product = await Product.create({ 
        ...args, 
        category: args.categoryId,
        imageUrl: args.imageUrl || undefined // Если нет в аргументах, сработает default из схемы
      });
      return product.populate('category');
    },
    deleteUser: async (_: any, { id }: any, context: any) => {
      await checkAdmin(context);

      const deletedUser = await User.findByIdAndDelete(id);

      if (!deletedUser) {
        throw new Error('Пользователь не найден');
      }

      return deletedUser;
    },
    deleteProduct: async (_: any, { id }: any, context: any) => {
        await checkAdmin(context);
        return Product.findByIdAndUpdate(id, { isDeleted: true });
    },
    updateProduct: async (_: any, { id, ...updateData }: any, context: any) => {
      await checkAdmin(context); // Проверка прав
      return Product.findByIdAndUpdate(id, updateData, { new: true }).populate('category');
    },
    createOrder: async (_: any, args: any, context: any) => {
      checkAuth(context);
      let total = 0;
      const items = await Promise.all(
        args.items.map(async (item: any) => {
          const product = await Product.findById(item.productId);
          if (!product || product.stock < item.quantity) throw new Error('Товара нет в наличии');
          
          product.stock -= item.quantity;
          await product.save();
          
          const price = product.price * item.quantity;
          total += price;
          return { product: product._id, quantity: item.quantity, price };
        })
      );

      const order = await Order.create({
        user: context.userId,
        items,
        totalPrice: total,
        status: 'NEW'
      });

      const populated = await order.populate(['user', 'items.product']);
      ee.emit(ORDER_CREATED, populated); 
      return populated;
    },
  },

  Subscription: {
    orderCreated: {
      subscribe: async function* () {
        const queue: any[] = [];
        const listener = (data: any) => queue.push(data);
        ee.on(ORDER_CREATED, listener);
        try {
          while (true) {
            if (queue.length > 0) yield { orderCreated: queue.shift() };
            await new Promise(r => setTimeout(r, 100));
          }
        } finally {
          ee.off(ORDER_CREATED, listener);
        }
      },
    },
  },
};