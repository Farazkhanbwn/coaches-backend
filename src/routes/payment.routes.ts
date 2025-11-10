import { Router } from 'express';
import { createPaymentSession, verifyPaymentSession } from '../controllers/payment.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { createLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

// Apply rate limiting to payment routes to prevent fraud
router.post('/create-checkout-session', verifyToken, createLimiter, createPaymentSession);
router.post('/verify-session', verifyToken, createLimiter, verifyPaymentSession);

export default router;
