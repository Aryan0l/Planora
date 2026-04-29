"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const databaseErrorCodes = new Set([
    'ECONNREFUSED',
    'ENOTFOUND',
    'EAI_AGAIN',
    'ETIMEDOUT',
    'EACCES',
    '28P01',
    '3D000',
    '57P01',
]);
const isDatabaseConnectionError = (error) => {
    if (databaseErrorCodes.has(error?.code)) {
        return true;
    }
    if (Array.isArray(error?.errors)) {
        return error.errors.some((nestedError) => databaseErrorCodes.has(nestedError?.code));
    }
    return false;
};
const errorHandler = (error, req, res, next) => {
    console.error(error);
    if (isDatabaseConnectionError(error)) {
        return res.status(503).json({
            success: false,
            message: 'Database connection failed. Check DATABASE_URL and DATABASE_SSL on Render.',
        });
    }
    const status = error.status || 500;
    const message = status >= 500 ? 'Internal server error' : error.message || 'Internal server error';
    const details = error.details || undefined;
    res.status(status).json({ success: false, message, details });
};
exports.errorHandler = errorHandler;
