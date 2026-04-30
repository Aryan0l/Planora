import express from 'express';
import { authenticate } from '../../http/middleware/requireUser';
import { ratePlan } from './studyPlan.controller';

const router = express.Router();

router.post('/:planId', authenticate, ratePlan);

export default router;
