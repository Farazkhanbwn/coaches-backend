import type { Request, Response } from 'express';
import Stripe from 'stripe';
import User from '../models/User.model.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover'
});

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).send('No signature');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const planType = session.metadata?.planType || 'Pro';
      const billingCycle = session.metadata?.billingCycle || 'Monthly';

      if (userId) {
        try {
          const user = await User.findById(userId);
          if (user) {
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
          }
        } catch (error) {
        }
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      // Handle subscription cancellation
      break;
    }

    default:
      break;
  }

  res.json({ received: true });
};
