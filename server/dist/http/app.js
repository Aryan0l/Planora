"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const user_routes_1 = __importDefault(require("../modules/users/user.routes"));
const studyPlan_routes_1 = __importDefault(require("../modules/studyPlans/studyPlan.routes"));
const follow_routes_1 = __importDefault(require("../modules/studyPlans/follow.routes"));
const progress_routes_1 = __importDefault(require("../modules/studyPlans/progress.routes"));
const rating_routes_1 = __importDefault(require("../modules/studyPlans/rating.routes"));
const pool_1 = __importStar(require("../database/pool"));
const requestLimiter_1 = require("./middleware/requestLimiter");
const errorResponder_1 = require("./middleware/errorResponder");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: true,
    credentials: true
}));
app.use(express_1.default.json());
app.use(requestLimiter_1.rateLimiter);
app.get('/api/health', async (req, res) => {
    const databaseInfo = (0, pool_1.getDatabaseConnectionInfo)();
    try {
        await pool_1.default.query('SELECT 1');
        res.json({
            success: true,
            status: 'ok',
            database: {
                ...databaseInfo,
                connected: true,
            },
        });
    }
    catch (error) {
        const connectionError = error;
        const codes = [
            connectionError.code,
            ...(connectionError.errors || []).map((nestedError) => nestedError.code),
        ].filter(Boolean);
        res.status(503).json({
            success: false,
            status: 'degraded',
            message: databaseInfo.configured
                ? 'Database connection failed. Check the backend DATABASE_URL and DATABASE_SSL settings on Render.'
                : 'Database connection is not configured. Add DATABASE_URL to the backend service environment on Render.',
            database: {
                ...databaseInfo,
                connected: false,
                errorCodes: [...new Set(codes)],
            },
        });
    }
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/plans', studyPlan_routes_1.default);
app.use('/api/follow', follow_routes_1.default);
app.use('/api/progress', progress_routes_1.default);
app.use('/api/rating', rating_routes_1.default);
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});
app.use(errorResponder_1.errorHandler);
exports.default = app;
