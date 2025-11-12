import { Router } from 'express';
import express from 'express';
import { handleStripeWebhook } from '../controllers/webhook.controller.js';

const router = Router();

// Webhook route needs raw body, not JSON parsed
router.post('/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
