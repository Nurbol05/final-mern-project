"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
describe('JWT', () => {
    it('creates valid token', () => {
        const token = jsonwebtoken_1.default.sign({ userId: '123' }, 'testsecret', { expiresIn: '1h' });
        const decoded = jsonwebtoken_1.default.verify(token, 'testsecret');
        expect(decoded.userId).toBe('123');
    });
});
