"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateAverageRating = exports.upsertRating = exports.getRatingByUserAndPlan = void 0;
const pool_1 = __importDefault(require("../../database/pool"));
const getRatingByUserAndPlan = async (userId, planId) => {
    const result = await pool_1.default.query('SELECT * FROM ratings WHERE user_id = $1 AND plan_id = $2', [userId, planId]);
    return result.rows[0] || null;
};
exports.getRatingByUserAndPlan = getRatingByUserAndPlan;
const upsertRating = async (userId, planId, rating) => {
    const result = await pool_1.default.query(`INSERT INTO ratings (user_id, plan_id, rating)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, plan_id)
     DO UPDATE SET rating = EXCLUDED.rating
     RETURNING *`, [userId, planId, rating]);
    return result.rows[0];
};
exports.upsertRating = upsertRating;
const calculateAverageRating = async (planId) => {
    const result = await pool_1.default.query('SELECT AVG(rating)::numeric(10,2) AS average_rating FROM ratings WHERE plan_id = $1', [planId]);
    return Number(result.rows[0]?.average_rating || 0);
};
exports.calculateAverageRating = calculateAverageRating;
