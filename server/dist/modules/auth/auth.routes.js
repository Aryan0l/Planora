"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("./auth.controller");
const validatePayload_1 = require("../../http/middleware/validatePayload");
const schemas_1 = require("../../shared/validation/schemas");
const router = express_1.default.Router();
router.post('/register', (0, validatePayload_1.validateBody)(schemas_1.registerSchema), auth_controller_1.register);
router.post('/login', (0, validatePayload_1.validateBody)(schemas_1.loginSchema), auth_controller_1.login);
router.post('/refresh', (0, validatePayload_1.validateBody)(schemas_1.refreshTokenSchema), auth_controller_1.refreshToken);
router.post('/logout', (0, validatePayload_1.validateBody)(schemas_1.refreshTokenSchema), auth_controller_1.logout);
exports.default = router;
