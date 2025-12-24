import express from 'express';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ApolloServer } from 'apollo-server-express';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';

import { typeDefs } from './graphql/TypeDefs';
import { resolvers } from './graphql/resolvers';
import { schema } from './graphql/schema'; // для подписок

dotenv.config();

const PORT = process.env.PORT || 4000;

async function startServer() {
  const app = express();

  const allowedOrigins = ['http://localhost:3000', 'https://studio.apollographql.com'];

  app.use(cors({
    origin: (origin, callback) => {
      // Разрешаем запросы без origin (например, мобильные приложения или curl) 
      // или если origin в списке разрешенных
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));


  app.use(express.json());

  await mongoose.connect(process.env.MONGO_URI as string);
  console.log('✅ MongoDB connected');

  const httpServer = http.createServer(app);

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  useServer(
    {
      schema,
      context: (ctx, msg, args) => {
        return {};
      },
    },
    wsServer
  );

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      const token = req.headers.authorization || '';
      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
          return { userId: decoded.userId, db: mongoose.connection }; // передаем DB
        } catch {
          return { db: mongoose.connection };
        }
      }
      return { db: mongoose.connection };
    },
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({
    app: app as any,
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
