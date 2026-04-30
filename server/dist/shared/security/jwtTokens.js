"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.signRefreshToken = exports.signAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const accessSecret = process.env.JWT_ACCESS_SECRET || 'access-secret';
const refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
const signAccessToken = (userId) => {
    return jsonwebtoken_1.default.sign({ sub: String(userId) }, accessSecret, { expiresIn: '15m' });
};
exports.signAccessToken = signAccessToken;
const signRefreshToken = (userId) => {
    return jsonwebtoken_1.default.sign({ sub: String(userId) }, refreshSecret, { expiresIn: '7d' });
};
exports.signRefreshToken = signRefreshToken;
const verifyAccessToken = (token) => {
    return jsonwebtoken_1.default.verify(token, accessSecret);
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, refreshSecret);
};
exports.verifyRefreshToken = verifyRefreshToken;
