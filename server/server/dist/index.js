"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const apollo_server_express_1 = require("apollo-server-express");
const ws_1 = require("ws");
const ws_2 = require("graphql-ws/lib/use/ws");
const TypeDefs_1 = require("./graphql/TypeDefs");
const resolvers_1 = require("./graphql/resolvers");
const schema_1 = require("./graphql/schema"); // для подписок
dotenv_1.default.config();
const PORT = process.env.PORT || 4000;
async function startServer() {
    const app = (0, express_1.default)();
    const allowedOrigins = ['http://localhost:3000', 'https://studio.apollographql.com'];
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            // Разрешаем запросы без origin (например, мобильные приложения или curl) 
            // или если origin в списке разрешенных
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    }));
    app.use(express_1.default.json());
    await mongoose_1.default.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
    const httpServer = http_1.default.createServer(app);
    const wsServer = new ws_1.WebSocketServer({
        server: httpServer,
        path: '/graphql',
    });
    (0, ws_2.useServer)({
        schema: schema_1.schema,
        context: (ctx, msg, args) => {
            return {};
        },
    }, wsServer);
    const apolloServer = new apollo_server_express_1.ApolloServer({
        typeDefs: TypeDefs_1.typeDefs,
        resolvers: resolvers_1.resolvers,
        context: ({ req }) => {
            const token = req.headers.authorization || '';
            if (token) {
                try {
                    const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                    return { userId: decoded.userId, db: mongoose_1.default.connection }; // передаем DB
                }
                catch {
                    return { db: mongoose_1.default.connection };
                }
            }
            return { db: mongoose_1.default.connection };
        },
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({
        app: app,
        path: '/graphql',
        cors: false,
    });
    httpServer.listen(PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
        console.log(`📡 Subscriptions ready at ws://localhost:${PORT}/graphql`);
    });
}
startServer().catch((err) => {
    console.error('❌ Server error:', err);
});
