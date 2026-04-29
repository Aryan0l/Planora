"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const plan_routes_1 = __importDefault(require("./routes/plan.routes"));
const follow_routes_1 = __importDefault(require("./routes/follow.routes"));
const progress_routes_1 = __importDefault(require("./routes/progress.routes"));
const rating_routes_1 = __importDefault(require("./routes/rating.routes"));
const db_1 = __importDefault(require("./config/db"));
const rateLimit_middleware_1 = require("./middleware/rateLimit.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: true,
    credentials: true
}));
app.use(express_1.default.json());
app.use(rateLimit_middleware_1.rateLimiter);
app.get('/api/health', async (req, res) => {
    const databaseConfigured = Boolean(process.env.DATABASE_URL || process.env.CONNECTION_URL);
    try {
        await db_1.default.query('SELECT 1');
        res.json({
            success: true,
            status: 'ok',
            database: {
                configured: databaseConfigured,
                connected: true,
            },
        });
    }
    catch (error) {
        res.status(503).json({
            success: false,
            status: 'degraded',
            message: databaseConfigured
                ? 'Database connection failed. Check the backend DATABASE_URL and DATABASE_SSL settings on Render.'
                : 'Database connection is not configured. Add DATABASE_URL to the backend service environment on Render.',
            database: {
                configured: databaseConfigured,
                connected: false,
            },
        });
    }
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/plans', plan_routes_1.default);
app.use('/api/follow', follow_routes_1.default);
app.use('/api/progress', progress_routes_1.default);
app.use('/api/rating', rating_routes_1.default);
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});
app.use(error_middleware_1.errorHandler);
exports.default = app;
