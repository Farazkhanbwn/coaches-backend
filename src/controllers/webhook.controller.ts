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
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (userId) {
        try {
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
            console.log(`Subscription activated for user ${userId}`);
          }
        } catch (error) {
          console.error('Error updating user subscription:', error);
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
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};
