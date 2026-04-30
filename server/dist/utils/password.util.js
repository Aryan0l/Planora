"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const SALT_ROUNDS = 12;
const hashPassword = async (plainText) => {
    return bcrypt_1.default.hash(plainText, SALT_ROUNDS);
};
exports.hashPassword = hashPassword;
const comparePassword = async (plainText, hashedPassword) => {
    try {
        return await bcrypt_1.default.compare(plainText, hashedPassword);
    }
    catch {
        return false;
    }
};
exports.comparePassword = comparePassword;
