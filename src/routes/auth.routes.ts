import { Router } from 'express';
import {
  signup,
  login,
  logout,
  verifyAuth,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  setupRepAccount,
  setupCoachAccount
} from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

// Apply strict rate limiting to auth routes
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/verify', verifyToken, verifyAuth);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/setup-rep', setupRepAccount);
router.post('/setup-coach', setupCoachAccount);

export default router;
