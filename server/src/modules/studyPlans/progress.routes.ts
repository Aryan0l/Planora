import express from 'express';
import { authenticate } from '../../http/middleware/requireUser';
import { getPlanProgress, updateProgress } from './studyPlan.controller';

const router = express.Router();

router.get('/:planId', authenticate, getPlanProgress);
router.post('/:planId', authenticate, updateProgress);

export default router;
