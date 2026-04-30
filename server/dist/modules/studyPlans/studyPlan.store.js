"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAverageRating = exports.updateFollowerCount = exports.getPopularStudyPlans = exports.listStudyPlans = exports.findPlanOwner = exports.findPlanById = exports.deleteStudyPlan = exports.updateStudyPlan = exports.createStudyPlan = void 0;
const pool_1 = __importDefault(require("../../database/pool"));
const createStudyPlan = async (creatorId, title, description, subject, durationDays) => {
    const result = await pool_1.default.query(`INSERT INTO study_plans (creator_id, title, description, subject, duration_days)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`, [creatorId, title, description, subject, durationDays]);
    return result.rows[0];
};
exports.createStudyPlan = createStudyPlan;
const updateStudyPlan = async (planId, updates) => {
    const fields = [];
    const values = [];
    if (updates.title) {
        fields.push('title = $' + (values.length + 1));
        values.push(updates.title);
    }
    if (updates.description) {
        fields.push('description = $' + (values.length + 1));
        values.push(updates.description);
    }
    if (updates.subject) {
        fields.push('subject = $' + (values.length + 1));
        values.push(updates.subject);
    }
    if (typeof updates.durationDays === 'number') {
        fields.push('duration_days = $' + (values.length + 1));
        values.push(updates.durationDays);
    }
    if (!fields.length) {
        const existing = await pool_1.default.query('SELECT * FROM study_plans WHERE id = $1', [planId]);
        return existing.rows[0] || null;
    }
    values.push(planId);
    const result = await pool_1.default.query(`UPDATE study_plans SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`, values);
    return result.rows[0] || null;
};
exports.updateStudyPlan = updateStudyPlan;
const deleteStudyPlan = async (planId) => {
    await pool_1.default.query('DELETE FROM study_plans WHERE id = $1', [planId]);
};
exports.deleteStudyPlan = deleteStudyPlan;
const findPlanById = async (planId) => {
    const result = await pool_1.default.query('SELECT * FROM study_plans WHERE id = $1', [planId]);
    return result.rows[0] || null;
};
exports.findPlanById = findPlanById;
const findPlanOwner = async (planId) => {
    const result = await pool_1.default.query('SELECT creator_id FROM study_plans WHERE id = $1', [planId]);
    return result.rows[0]?.creator_id || null;
};
exports.findPlanOwner = findPlanOwner;
const listStudyPlans = async (filters) => {
    const conditions = [];
    const values = [];
    if (filters.search) {
        values.push(`%${filters.search.toLowerCase()}%`);
        conditions.push('LOWER(title) LIKE $' + values.length);
    }
    if (filters.subject) {
        values.push(filters.subject);
        conditions.push('subject = $' + values.length);
    }
    if (typeof filters.minRating === 'number') {
        values.push(filters.minRating);
        conditions.push('average_rating >= $' + values.length);
    }
    if (typeof filters.maxDuration === 'number') {
        values.push(filters.maxDuration);
        conditions.push('duration_days <= $' + values.length);
    }
    let orderBy = 'created_at DESC';
    if (filters.sortBy === 'popular') {
        orderBy = 'follower_count DESC, average_rating DESC';
    }
    else if (filters.sortBy === 'rating') {
        orderBy = 'average_rating DESC, follower_count DESC';
    }
    else if (filters.sortBy === 'duration') {
        orderBy = 'duration_days ASC';
    }
    const query = `SELECT id, title, description, subject, duration_days AS "durationDays", average_rating AS "averageRating", follower_count AS "followerCount", creator_id AS "creatorId"
    FROM study_plans
    ${conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''}
    ORDER BY ${orderBy}`;
    const result = await pool_1.default.query(query, values);
    return result.rows;
};
exports.listStudyPlans = listStudyPlans;
const getPopularStudyPlans = async () => {
    const result = await pool_1.default.query(`SELECT id, title, description, subject, duration_days AS "durationDays", average_rating AS "averageRating", follower_count AS "followerCount", creator_id AS "creatorId"
     FROM study_plans
     ORDER BY follower_count DESC, average_rating DESC
     LIMIT 12`);
    return result.rows;
};
exports.getPopularStudyPlans = getPopularStudyPlans;
const updateFollowerCount = async (planId, delta) => {
    await pool_1.default.query('UPDATE study_plans SET follower_count = GREATEST(follower_count + $1, 0) WHERE id = $2', [delta, planId]);
};
exports.updateFollowerCount = updateFollowerCount;
const updateAverageRating = async (planId, averageRating) => {
    await pool_1.default.query('UPDATE study_plans SET average_rating = $1 WHERE id = $2', [averageRating, planId]);
};
exports.updateAverageRating = updateAverageRating;
