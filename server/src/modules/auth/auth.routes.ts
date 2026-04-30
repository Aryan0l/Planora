import express from 'express';
import { register, login, refreshToken, logout } from './auth.controller';
import { validateBody } from '../../http/middleware/validatePayload';
import { registerSchema, loginSchema, refreshTokenSchema } from '../../shared/validation/schemas';

const router = express.Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', validateBody(refreshTokenSchema), refreshToken);
router.post('/logout', validateBody(refreshTokenSchema), logout);

export default router;
