"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const requireUser_1 = require("../../http/middleware/requireUser");
const user_controller_1 = require("./user.controller");
const router = express_1.default.Router();
router.get('/me', requireUser_1.authenticate, user_controller_1.getProfile);
exports.default = router;
