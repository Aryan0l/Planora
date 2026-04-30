"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const requireUser_1 = require("../../http/middleware/requireUser");
const studyPlan_controller_1 = require("./studyPlan.controller");
const router = express_1.default.Router();
router.post('/:planId', requireUser_1.authenticate, studyPlan_controller_1.followPlan);
router.delete('/:planId', requireUser_1.authenticate, studyPlan_controller_1.unfollowPlan);
exports.default = router;
