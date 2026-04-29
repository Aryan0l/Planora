"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFollowerCount = exports.removeFollower = exports.addFollower = exports.isFollowingPlan = void 0;
const db_1 = __importDefault(require("../config/db"));
const isFollowingPlan = async (userId, planId) => {
    const result = await db_1.default.query('SELECT id FROM followers WHERE user_id = $1 AND plan_id = $2', [userId, planId]);
    return result.rows.length > 0;
};
exports.isFollowingPlan = isFollowingPlan;
const addFollower = async (userId, planId) => {
    await db_1.default.query(`INSERT INTO followers (user_id, plan_id)
     VALUES ($1, $2)
     ON CONFLICT (user_id, plan_id) DO NOTHING`, [userId, planId]);
};
exports.addFollower = addFollower;
const removeFollower = async (userId, planId) => {
    await db_1.default.query('DELETE FROM followers WHERE user_id = $1 AND plan_id = $2', [userId, planId]);
};
exports.removeFollower = removeFollower;
const getFollowerCount = async (planId) => {
    const result = await db_1.default.query('SELECT COUNT(*) FROM followers WHERE plan_id = $1', [planId]);
    return Number(result.rows[0]?.count || 0);
};
exports.getFollowerCount = getFollowerCount;
