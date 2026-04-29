"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = require("pg");
dotenv_1.default.config();
const normalizeConnectionString = (value) => {
    if (!value) {
        return value;
    }
    try {
        const url = new URL(value);
        const sslMode = url.searchParams.get('sslmode');
        const hasCompatFlag = url.searchParams.has('uselibpqcompat');
        if (sslMode && !hasCompatFlag && ['prefer', 'require', 'verify-ca'].includes(sslMode)) {
            url.searchParams.set('uselibpqcompat', 'true');
            return url.toString();
        }
    }
    catch {
        return value;
    }
    return value;
};
const connectionString = normalizeConnectionString(process.env.DATABASE_URL || process.env.CONNECTION_URL);
const pool = new pg_1.Pool({
    connectionString,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 10, // max connections in pool
    min: 2, // keep 2 warm connections always ready
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});
// Warm up the pool on startup so first request isn't slow
pool.query('SELECT 1').catch(() => { });
exports.default = pool;
