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
