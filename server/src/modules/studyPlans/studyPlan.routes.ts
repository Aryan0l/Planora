import express from 'express';
import { authenticate } from '../../http/middleware/requireUser';
import { validateBody } from '../../http/middleware/validatePayload';
import {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan,
  followPlan,
  unfollowPlan,
  getPlanProgress,
  updateProgress,
  ratePlan,
  getPopularPlans,
} from './studyPlan.controller';
import {
  planSchema,
  planUpdateSchema,
  progressSchema,
  ratingSchema,
} from '../../shared/validation/schemas';

const router = express.Router();

router.get('/', getPlans);
router.get('/popular', getPopularPlans);
router.get('/:planId', getPlanById);
router.post('/', authenticate, validateBody(planSchema), createPlan);
router.put('/:planId', authenticate, validateBody(planUpdateSchema), updatePlan);
router.delete('/:planId', authenticate, deletePlan);
router.post('/:planId/follow', authenticate, followPlan);
router.delete('/:planId/follow', authenticate, unfollowPlan);
router.get('/:planId/progress', authenticate, getPlanProgress);
router.post('/:planId/progress', authenticate, validateBody(progressSchema), updateProgress);
router.post('/:planId/rating', authenticate, validateBody(ratingSchema), ratePlan);

export default router;