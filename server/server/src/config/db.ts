// src/db.ts
import { MongoClient, Db } from "mongodb";

let db: Db;

export const connectDB = async () => {
  if (db) return db; // если уже подключено
  const client = new MongoClient("mongodb://mongo:27017"); // mongo — имя контейнера из docker-compose
  await client.connect();
  db = client.db("myshop"); // имя базы данных
  console.log("✅ MongoDB connected");
  return db;
};

export const getDB = () => {
  if (!db) throw new Error("Database not connected");
  return db;
};
