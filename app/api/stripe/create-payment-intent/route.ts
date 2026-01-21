import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/src/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { amount, currency = 'usd' } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // 创建支付意图
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe 使用最小货币单位 (分)
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
