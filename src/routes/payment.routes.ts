import { Router } from 'express';
import { createPaymentSession, verifyPaymentSession } from '../controllers/payment.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/create-checkout-session', verifyToken, createPaymentSession);
router.post('/verify-session', verifyToken, verifyPaymentSession);

export default router;
