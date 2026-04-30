"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeRefreshToken = exports.findRefreshToken = exports.saveRefreshToken = void 0;
const pool_1 = __importDefault(require("../../database/pool"));
const saveRefreshToken = async (userId, token) => {
    await pool_1.default.query(`INSERT INTO refresh_tokens (user_id, token, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '7 days')
     ON CONFLICT (token) DO NOTHING`, [userId, token]);
};
exports.saveRefreshToken = saveRefreshToken;
const findRefreshToken = async (token) => {
    const result = await pool_1.default.query('SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()', [token]);
    return result.rows[0] || null;
};
exports.findRefreshToken = findRefreshToken;
const revokeRefreshToken = async (token) => {
    await pool_1.default.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
};
exports.revokeRefreshToken = revokeRefreshToken;
