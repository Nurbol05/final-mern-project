"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../../models/User");
const Category_1 = require("../../models/Category");
const Product_1 = require("../../models/Product");
const Order_1 = require("../../models/Order");
const events_1 = __importDefault(require("events"));
const ee = new events_1.default();
const ORDER_CREATED = 'ORDER_CREATED';
// Вспомогательная функция проверки авторизации
const checkAuth = (context) => {
    if (!context.userId)
        throw new Error('Необходима авторизация');
};
const checkAdmin = async (context) => {
    if (!context.userId)
        throw new Error('Необходима авторизация');
    const user = await User_1.User.findById(context.userId);
    if (!user || user.role !== 'ADMIN') {
        throw new Error('Доступ запрещен: требуются права администратора');
    }
};
exports.resolvers = {
    Query: {
        me: async (_, __, context) => {
            if (!context.userId)
                return null;
            return await User_1.User.findById(context.userId);
        },
        categories: async () => Category_1.Category.find({ isDeleted: false }),
        products: async (_, args) => {
            const filter = { isDeleted: false };
            if (args.categoryId)
                filter.category = args.categoryId;
            return Product_1.Product.find(filter).populate('category');
        },
        product: async (_, { id }) => {
            return Product_1.Product.findById(id).populate('category');
        },
        orders: async (_, __, context) => {
            checkAuth(context);
            return Order_1.Order.find({ user: context.userId }).populate('user').populate('items.product');
        },
        getProducts: async () => {
            return await Product_1.Product.find({ isDeleted: false }).populate('category');
        },
    },
    Mutation: {
        register: async (_, args) => {
            const hashed = await bcryptjs_1.default.hash(args.password, 10);
            // Заменяем на 'USER' (или 'ADMIN', если это регистрация админа)
            const user = await User_1.User.create({ email: args.email, password: hashed, role: 'USER' });
            return jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        },
        login: async (_, args) => {
            const user = await User_1.User.findOne({ email: args.email });
            if (!user)
                throw new Error('Пользователь не найден');
            const valid = await bcryptjs_1.default.compare(args.password, user.password);
            if (!valid)
                throw new Error('Неверный пароль');
            return jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        },
        createCategory: async (_, args, context) => {
            await checkAdmin(context); // Проверка прав
            return Category_1.Category.create(args);
        },
        createProduct: async (_, args, context) => {
            await checkAdmin(context);
            const product = await Product_1.Product.create({
                ...args,
                category: args.categoryId,
                imageUrl: args.imageUrl || undefined // Если нет в аргументах, сработает default из схемы
            });
            return product.populate('category');
        },
        deleteUser: async (_, { id }, context) => {
            await checkAdmin(context);
            const deletedUser = await User_1.User.findByIdAndDelete(id);
            if (!deletedUser) {
                throw new Error('Пользователь не найден');
            }
            return deletedUser;
        },
        deleteProduct: async (_, { id }, context) => {
            await checkAdmin(context);
            return Product_1.Product.findByIdAndUpdate(id, { isDeleted: true });
        },
        updateProduct: async (_, { id, ...updateData }, context) => {
            await checkAdmin(context); // Проверка прав
            return Product_1.Product.findByIdAndUpdate(id, updateData, { new: true }).populate('category');
        },
        createOrder: async (_, args, context) => {
            checkAuth(context);
            let total = 0;
            const items = await Promise.all(args.items.map(async (item) => {
                const product = await Product_1.Product.findById(item.productId);
                if (!product || product.stock < item.quantity)
                    throw new Error('Товара нет в наличии');
                product.stock -= item.quantity;
                await product.save();
                const price = product.price * item.quantity;
                total += price;
                return { product: product._id, quantity: item.quantity, price };
            }));
            const order = await Order_1.Order.create({
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
                const queue = [];
                const listener = (data) => queue.push(data);
                ee.on(ORDER_CREATED, listener);
                try {
                    while (true) {
                        if (queue.length > 0)
                            yield { orderCreated: queue.shift() };
                        await new Promise(r => setTimeout(r, 100));
                    }
                }
                finally {
                    ee.off(ORDER_CREATED, listener);
                }
            },
        },
    },
};
