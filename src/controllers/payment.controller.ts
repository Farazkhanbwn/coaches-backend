import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { createCheckoutSession } from '../services/stripe.service.js';
import User from '../models/User.model.js';
import stripe from '../services/stripe.service.js';

export const createPaymentSession = async (req: AuthRequest, res: Response) => {
  try {
    const { priceId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const session = await createCheckoutSession(priceId, userId, user.email);

    res.status(200).json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Create payment session error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment session' });
  }
};

export const verifyPaymentSession = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid' && session.metadata?.userId === userId) {
      const user = await User.findById(userId);
      if (user) {
        user.subscription = {
          plan: 'Pro',
          status: 'Active',
          billingCycle: 'Monthly',
          startDate: new Date(),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          lastUpdatedAt: new Date()
        };
        await user.save();
        return res.status(200).json({ success: true, message: 'Subscription activated' });
      }
    }

    res.status(400).json({ success: false, message: 'Payment verification failed' });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify payment' });
  }
};
