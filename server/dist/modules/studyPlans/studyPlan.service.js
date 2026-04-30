"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ratePlan = exports.updateProgress = exports.getPlanProgress = exports.unfollowPlan = exports.followPlan = exports.deletePlan = exports.updatePlan = exports.getPlanById = exports.getPopularPlans = exports.getPlans = exports.createPlan = void 0;
const planModel = __importStar(require("./studyPlan.store"));
const taskModel = __importStar(require("./task.store"));
const followModel = __importStar(require("./follow.store"));
const progressModel = __importStar(require("./progress.store"));
const ratingModel = __importStar(require("./rating.store"));
const createPlan = async (userId, payload) => {
    const plan = await planModel.createStudyPlan(userId, payload.title, payload.description, payload.subject, payload.durationDays);
    const tasks = await taskModel.insertPlanTasks(plan.id, payload.tasks);
    return { ...plan, tasks };
};
exports.createPlan = createPlan;
const getPlans = async (query) => {
    return planModel.listStudyPlans({
        search: query.search,
        subject: query.subject,
        minRating: query.minRating,
        sortBy: query.sortBy,
        maxDuration: query.maxDuration,
    });
};
exports.getPlans = getPlans;
const getPopularPlans = async () => {
    return planModel.getPopularStudyPlans();
};
exports.getPopularPlans = getPopularPlans;
const getPlanById = async (planId) => {
    const plan = await planModel.findPlanById(planId);
    if (!plan) {
        throw { status: 404, message: 'Study plan not found' };
    }
    const tasks = await taskModel.getPlanTasks(planId);
    return { ...plan, tasks };
};
exports.getPlanById = getPlanById;
const updatePlan = async (userId, planId, updates) => {
    const ownerId = await planModel.findPlanOwner(planId);
    if (!ownerId || ownerId !== userId) {
        throw { status: 403, message: 'Forbidden' };
    }
    const plan = await planModel.updateStudyPlan(planId, updates);
    if (!plan) {
        throw { status: 404, message: 'Study plan not found' };
    }
    if (updates.tasks) {
        await taskModel.deletePlanTasks(planId);
        await taskModel.insertPlanTasks(planId, updates.tasks);
    }
    const tasks = await taskModel.getPlanTasks(planId);
    return { ...plan, tasks };
};
exports.updatePlan = updatePlan;
const deletePlan = async (userId, planId) => {
    const ownerId = await planModel.findPlanOwner(planId);
    if (!ownerId || ownerId !== userId) {
        throw { status: 403, message: 'Forbidden' };
    }
    await planModel.deleteStudyPlan(planId);
};
exports.deletePlan = deletePlan;
const followPlan = async (userId, planId) => {
    const existing = await followModel.isFollowingPlan(userId, planId);
    if (existing) {
        throw { status: 400, message: 'Already following this plan' };
    }
    await followModel.addFollower(userId, planId);
    await planModel.updateFollowerCount(planId, 1);
    return { success: true };
};
exports.followPlan = followPlan;
const unfollowPlan = async (userId, planId) => {
    const existing = await followModel.isFollowingPlan(userId, planId);
    if (!existing) {
        throw { status: 400, message: 'Not following this plan' };
    }
    await followModel.removeFollower(userId, planId);
    await planModel.updateFollowerCount(planId, -1);
    return { success: true };
};
exports.unfollowPlan = unfollowPlan;
const getPlanProgress = async (userId, planId) => {
    const plan = await planModel.findPlanById(planId);
    if (!plan) {
        throw { status: 404, message: 'Study plan not found' };
    }
    const tasks = await taskModel.getPlanTasks(planId);
    const completedTaskIds = await progressModel.getCompletedTaskIds(userId, planId);
    const completedCount = completedTaskIds.length;
    const completionRate = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
    return {
        planId,
        totalTasks: tasks.length,
        completedTaskIds,
        completionRate,
        tasks,
    };
};
exports.getPlanProgress = getPlanProgress;
const updateProgress = async (userId, planId, completedTaskIds) => {
    const plan = await planModel.findPlanById(planId);
    if (!plan) {
        throw { status: 404, message: 'Study plan not found' };
    }
    const tasks = await taskModel.getPlanTasks(planId);
    const validTaskIds = tasks.map((task) => task.id);
    const sanitizedTaskIds = completedTaskIds.filter((id) => validTaskIds.includes(id));
    await progressModel.deleteProgressForPlan(userId, planId);
    await progressModel.insertProgress(userId, planId, sanitizedTaskIds);
    const completionRate = tasks.length
        ? Math.round((sanitizedTaskIds.length / tasks.length) * 100)
        : 0;
    return {
        planId,
        completedTaskIds: sanitizedTaskIds,
        completionRate,
    };
};
exports.updateProgress = updateProgress;
const ratePlan = async (userId, planId, rating) => {
    const plan = await planModel.findPlanById(planId);
    if (!plan) {
        throw { status: 404, message: 'Study plan not found' };
    }
    await ratingModel.upsertRating(userId, planId, rating);
    const averageRating = await ratingModel.calculateAverageRating(planId);
    await planModel.updateAverageRating(planId, averageRating);
    return { planId, rating, averageRating };
};
exports.ratePlan = ratePlan;
