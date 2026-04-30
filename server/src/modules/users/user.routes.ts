import express from 'express';
import { authenticate } from '../../http/middleware/requireUser';
import { getProfile } from './user.controller';

const router = express.Router();

router.get('/me', authenticate, getProfile);

export default router;
