import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/src/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    const { priceId, amount, currency = 'usd', successUrl, cancelUrl } = await req.json();

    // 支持两种方式：priceId 或 amount
    if (!priceId && !amount) {
      return NextResponse.json(
        { error: 'Price ID or amount is required' },
        { status: 400 }
      );
    }

    // 创建 Checkout 会话
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: priceId ? [
        {
          price: priceId,
          quantity: 1,
        },
      ] : [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: '在线支付',
            },
            unit_amount: Math.round(amount * 100), // 转换为分
          },
          quantity: 1,
        },
      ],
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
    });

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
