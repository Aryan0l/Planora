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
const planService = __importStar(require("../services/plan.service"));
const createPlan = async (req, res, next) => {
    try {
        const plan = await planService.createPlan(req.user.id, req.body);
        res.status(201).json({ success: true, data: plan });
    }
    catch (error) {
        next(error);
    }
};
exports.createPlan = createPlan;
const getPlans = async (req, res, next) => {
    try {
        const subjectQuery = typeof req.query.subject === 'string'
            ? req.query.subject
            : typeof req.query.category === 'string'
                ? req.query.category
                : undefined;
        const plans = await planService.getPlans({
            search: typeof req.query.search === 'string' ? req.query.search : undefined,
            subject: subjectQuery,
            minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
            maxDuration: req.query.duration ? Number(req.query.duration) : undefined,
            sortBy: typeof req.query.sortBy === 'string' ? req.query.sortBy : undefined,
        });
        res.json({ success: true, data: plans });
    }
    catch (error) {
        next(error);
    }
};
exports.getPlans = getPlans;
const getPopularPlans = async (req, res, next) => {
    try {
        const plans = await planService.getPopularPlans();
        res.json({ success: true, data: plans });
    }
    catch (error) {
        next(error);
    }
};
exports.getPopularPlans = getPopularPlans;
const getPlanById = async (req, res, next) => {
    try {
        const planId = Number(req.params.planId);
        const plan = await planService.getPlanById(planId);
        res.json({ success: true, data: plan });
    }
    catch (error) {
        next(error);
    }
};
exports.getPlanById = getPlanById;
const updatePlan = async (req, res, next) => {
    try {
        const planId = Number(req.params.planId);
        const plan = await planService.updatePlan(req.user.id, planId, req.body);
        res.json({ success: true, data: plan });
    }
    catch (error) {
        next(error);
    }
};
exports.updatePlan = updatePlan;
const deletePlan = async (req, res, next) => {
    try {
        const planId = Number(req.params.planId);
        await planService.deletePlan(req.user.id, planId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
};
exports.deletePlan = deletePlan;
const followPlan = async (req, res, next) => {
    try {
        const planId = Number(req.params.planId);
        await planService.followPlan(req.user.id, planId);
        res.status(200).json({ success: true, message: 'Plan followed' });
    }
    catch (error) {
        next(error);
    }
};
exports.followPlan = followPlan;
const unfollowPlan = async (req, res, next) => {
    try {
        const planId = Number(req.params.planId);
        await planService.unfollowPlan(req.user.id, planId);
        res.status(200).json({ success: true, message: 'Plan unfollowed' });
    }
    catch (error) {
        next(error);
    }
};
exports.unfollowPlan = unfollowPlan;
const getPlanProgress = async (req, res, next) => {
    try {
        const planId = Number(req.params.planId);
        const progress = await planService.getPlanProgress(req.user.id, planId);
        res.json({ success: true, data: progress });
    }
    catch (error) {
        next(error);
    }
};
exports.getPlanProgress = getPlanProgress;
const updateProgress = async (req, res, next) => {
    try {
        const planId = Number(req.params.planId);
        const progress = await planService.updateProgress(req.user.id, planId, req.body.completedTaskIds);
        res.json({ success: true, data: progress });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProgress = updateProgress;
const ratePlan = async (req, res, next) => {
    try {
        const planId = Number(req.params.planId);
        const rating = Number(req.body.rating);
        const result = await planService.ratePlan(req.user.id, planId, rating);
        res.status(201).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
};
exports.ratePlan = ratePlan;
