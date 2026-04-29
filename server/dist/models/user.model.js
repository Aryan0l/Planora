"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserFollowedPlans = exports.getUserCreatedPlans = exports.createUser = exports.findUserById = exports.findUserByEmail = void 0;
const db_1 = __importDefault(require("../config/db"));
const findUserByEmail = async (email) => {
    const result = await db_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
};
exports.findUserByEmail = findUserByEmail;
const findUserById = async (userId) => {
    const result = await db_1.default.query('SELECT * FROM users WHERE id = $1', [userId]);
    return result.rows[0] || null;
};
exports.findUserById = findUserById;
const createUser = async (name, email, password) => {
    const result = await db_1.default.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *', [name, email, password]);
    return result.rows[0];
};
exports.createUser = createUser;
const getUserCreatedPlans = async (userId) => {
    const result = await db_1.default.query(`
    SELECT 
      id,
      title,
      subject AS "category",
      duration_days AS "durationDays",
      average_rating AS "averageRating",
      follower_count AS "followerCount"
    FROM study_plans
    WHERE creator_id = $1
    ORDER BY created_at DESC
    `, [userId]);
    return result.rows;
};
exports.getUserCreatedPlans = getUserCreatedPlans;
const getUserFollowedPlans = async (userId) => {
    const result = await db_1.default.query(`
    SELECT 
      p.id,
      p.title,
      p.subject AS "category",
      p.duration_days AS "durationDays",
      p.average_rating AS "averageRating",
      p.follower_count AS "followerCount"
    FROM study_plans p
    JOIN followers f ON f.plan_id = p.id
    WHERE f.user_id = $1
    ORDER BY f.created_at DESC
    `, [userId]);
    return result.rows;
};
exports.getUserFollowedPlans = getUserFollowedPlans;
