import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET) {
  throw new Error('STRIPE_SECRET is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});
