"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ratingSchema = exports.progressSchema = exports.planUpdateSchema = exports.planSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.registerSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(8).required(),
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
});
exports.refreshTokenSchema = joi_1.default.object({
    refreshToken: joi_1.default.string().required(),
});
const taskSchema = joi_1.default.object({
    day: joi_1.default.number().integer().min(1).required(),
    title: joi_1.default.string().min(1).required(),
    description: joi_1.default.string().allow('').required(),
});
const normalizePlanPayload = (value) => {
    if (!value.subject && typeof value.category === 'string') {
        value.subject = value.category;
    }
    delete value.category;
    return value;
};
exports.planSchema = joi_1.default.object({
    title: joi_1.default.string().min(5).max(200).required(),
    description: joi_1.default.string().min(10).required(),
    subject: joi_1.default.string().min(2).max(100),
    category: joi_1.default.string().min(2).max(100),
    durationDays: joi_1.default.number().integer().min(1).required(),
    tasks: joi_1.default.array().items(taskSchema).min(1).required(),
})
    .or('subject', 'category')
    .custom(normalizePlanPayload);
exports.planUpdateSchema = joi_1.default.object({
    title: joi_1.default.string().min(5).max(200),
    description: joi_1.default.string().min(10),
    subject: joi_1.default.string().min(2).max(100),
    category: joi_1.default.string().min(2).max(100),
    durationDays: joi_1.default.number().integer().min(1),
    tasks: joi_1.default.array().items(taskSchema).min(1),
}).custom(normalizePlanPayload);
exports.progressSchema = joi_1.default.object({
    completedTaskIds: joi_1.default.array().items(joi_1.default.number().integer().positive()).required(),
});
exports.ratingSchema = joi_1.default.object({
    rating: joi_1.default.number().integer().min(1).max(5).required(),
});
