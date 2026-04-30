import express from 'express';
import { authenticate } from '../../http/middleware/requireUser';
import { followPlan, unfollowPlan } from './studyPlan.controller';

const router = express.Router();

router.post('/:planId', authenticate, followPlan);
router.delete('/:planId', authenticate, unfollowPlan);

export default router;
