import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validation';
import { authenticate, adminOnly } from '../../middleware/auth';
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  changePasswordSchema,
} from './auth.validation';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh', validate(refreshTokenSchema), AuthController.refreshToken);
router.post('/logout', AuthController.logout);

// Protected routes
router.use(authenticate); // All routes below require authentication

router.get('/profile', AuthController.getProfile);
router.get('/verify', AuthController.verifyToken);
router.put('/change-password', validate(changePasswordSchema), AuthController.changePassword);

// Admin only routes
router.delete('/clean-tokens', adminOnly, AuthController.cleanExpiredTokens);

export default router;