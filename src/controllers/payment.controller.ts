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

    // Determine plan type and billing cycle from priceId
    let planType = 'Pro';
    let billingCycle = 'Monthly';
    
    if (priceId === process.env.STRIPE_TEAM_PLAN_PRICE_ID || priceId === process.env.STRIPE_TEAM_YEARLY_PRICE_ID) {
      planType = 'Enterprise';
    }
    
    if (priceId === process.env.STRIPE_PRO_YEARLY_PRICE_ID || priceId === process.env.STRIPE_TEAM_YEARLY_PRICE_ID) {
      billingCycle = 'Yearly';
    }

    const session = await createCheckoutSession(priceId, userId, user.email, planType, billingCycle);

    res.status(200).json({ success: true, sessionId: session.id, url: session.url });
  } catch (error) {
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
        const planType = session.metadata?.planType || 'Pro';
        const billingCycle = session.metadata?.billingCycle || 'Monthly';
        const daysToAdd = billingCycle === 'Yearly' ? 365 : 30;
        user.subscription = {
          plan: planType as 'Free' | 'Pro' | 'Enterprise',
          status: 'Active',
          billingCycle: billingCycle as 'Monthly' | 'Yearly',
          startDate: new Date(),
          nextBillingDate: new Date(Date.now() + daysToAdd * 24 * 60 * 60 * 1000),
          lastUpdatedAt: new Date()
        };
        await user.save();
        return res.status(200).json({ success: true, message: 'Subscription activated' });
      }
    }

    res.status(400).json({ success: false, message: 'Payment verification failed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to verify payment' });
  }
};
