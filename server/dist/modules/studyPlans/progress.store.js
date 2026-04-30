"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.countCompletedTasks = exports.insertProgress = exports.deleteProgressForPlan = exports.getCompletedTaskIds = void 0;
const pool_1 = __importDefault(require("../../database/pool"));
let usesArrayProgressTable = null;
const hasCompletedTaskIdsArray = async () => {
    if (usesArrayProgressTable !== null) {
        return usesArrayProgressTable;
    }
    const result = await pool_1.default.query(`SELECT 1
     FROM information_schema.columns
     WHERE table_name = 'progress' AND column_name = 'completed_task_ids'`);
    usesArrayProgressTable = result.rows.length > 0;
    return usesArrayProgressTable;
};
const getCompletedTaskIds = async (userId, planId) => {
    if (await hasCompletedTaskIdsArray()) {
        const result = await pool_1.default.query(`SELECT completed_task_ids
       FROM progress
       WHERE user_id = $1 AND plan_id = $2`, [userId, planId]);
        return result.rows[0]?.completed_task_ids || [];
    }
    const result = await pool_1.default.query(`SELECT task_id FROM progress WHERE user_id = $1 AND plan_id = $2 AND completed = true`, [userId, planId]);
    return result.rows.map((row) => row.task_id);
};
exports.getCompletedTaskIds = getCompletedTaskIds;
const deleteProgressForPlan = async (userId, planId) => {
    await pool_1.default.query('DELETE FROM progress WHERE user_id = $1 AND plan_id = $2', [userId, planId]);
};
exports.deleteProgressForPlan = deleteProgressForPlan;
const insertProgress = async (userId, planId, taskIds) => {
    if (!taskIds.length) {
        return;
    }
    if (await hasCompletedTaskIdsArray()) {
        await pool_1.default.query(`INSERT INTO progress (user_id, plan_id, completed_task_ids, updated_at)
       VALUES ($1, $2, $3, NOW())`, [userId, planId, taskIds]);
        return;
    }
    const inserts = [];
    const values = [userId, planId];
    taskIds.forEach((taskId, index) => {
        inserts.push(`($1, $2, $${index + 3}, true)`);
        values.push(taskId);
    });
    await pool_1.default.query(`INSERT INTO progress (user_id, plan_id, task_id, completed)
     VALUES ${inserts.join(', ')}
     ON CONFLICT (user_id, plan_id, task_id) DO UPDATE SET completed = EXCLUDED.completed`, values);
};
exports.insertProgress = insertProgress;
const countCompletedTasks = async (userId, planId) => {
    if (await hasCompletedTaskIdsArray()) {
        const result = await pool_1.default.query(`SELECT COALESCE(array_length(completed_task_ids, 1), 0) AS count
       FROM progress
       WHERE user_id = $1 AND plan_id = $2`, [userId, planId]);
        return Number(result.rows[0]?.count || 0);
    }
    const result = await pool_1.default.query('SELECT COUNT(*) FROM progress WHERE user_id = $1 AND plan_id = $2 AND completed = true', [userId, planId]);
    return Number(result.rows[0]?.count || 0);
};
exports.countCompletedTasks = countCompletedTasks;
