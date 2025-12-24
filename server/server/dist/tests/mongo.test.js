"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
let mongo;
beforeAll(async () => {
    mongo = await mongodb_memory_server_1.MongoMemoryServer.create();
    await mongoose_1.default.connect(mongo.getUri());
});
afterAll(async () => {
    await mongoose_1.default.disconnect();
    await mongo.stop();
});
it('connects to in-memory mongo', async () => {
    const collections = await mongoose_1.default.connection.db.collections();
    expect(collections).toBeDefined();
});
