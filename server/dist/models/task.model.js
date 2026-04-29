"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.countPlanTasks = exports.deletePlanTasks = exports.getPlanTasks = exports.insertPlanTasks = void 0;
const db_1 = __importDefault(require("../config/db"));
const insertPlanTasks = async (planId, tasks) => {
    if (!tasks.length) {
        return [];
    }
    const values = [];
    const inserts = tasks.map((task, index) => {
        const offset = index * 4;
        values.push(planId, task.day, task.title, task.description);
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`;
    });
    const result = await db_1.default.query(`INSERT INTO plan_tasks (plan_id, day_number, title, description)
     VALUES ${inserts.join(', ')} RETURNING *`, values);
    return result.rows;
};
exports.insertPlanTasks = insertPlanTasks;
const getPlanTasks = async (planId) => {
    const result = await db_1.default.query(`SELECT id, day_number AS day, title, description
     FROM plan_tasks
     WHERE plan_id = $1
     ORDER BY day_number ASC`, [planId]);
    return result.rows;
};
exports.getPlanTasks = getPlanTasks;
const deletePlanTasks = async (planId) => {
    await db_1.default.query('DELETE FROM plan_tasks WHERE plan_id = $1', [planId]);
};
exports.deletePlanTasks = deletePlanTasks;
const countPlanTasks = async (planId) => {
    const result = await db_1.default.query('SELECT COUNT(*) FROM plan_tasks WHERE plan_id = $1', [planId]);
    return Number(result.rows[0]?.count || 0);
};
exports.countPlanTasks = countPlanTasks;
