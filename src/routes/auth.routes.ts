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
  setupRepAccount
} from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/verify', verifyToken, verifyAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/setup-rep', setupRepAccount);

export default router;
