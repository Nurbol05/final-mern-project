"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDB = exports.connectDB = void 0;
// src/db.ts
const mongodb_1 = require("mongodb");
let db;
const connectDB = async () => {
    if (db)
        return db; // если уже подключено
    const client = new mongodb_1.MongoClient("mongodb://mongo:27017"); // mongo — имя контейнера из docker-compose
    await client.connect();
    db = client.db("myshop"); // имя базы данных
    console.log("✅ MongoDB connected");
    return db;
};
exports.connectDB = connectDB;
const getDB = () => {
    if (!db)
        throw new Error("Database not connected");
    return db;
};
exports.getDB = getDB;
