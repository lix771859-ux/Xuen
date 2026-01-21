// app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sendPaymentSuccessEmail } from '@/src/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET! as string, {
  apiVersion: '2025-12-15.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  console.log('📩 Webhook received request');
  
  try {
    console.log('⏳ Reading request body...');
    const buf = await req.arrayBuffer();
    const payload = Buffer.from(buf).toString('utf8');
    
    const sig = req.headers.get('stripe-signature');
    
    if (!sig) {
      console.error('❌ No signature found');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    console.log('🔐 Verifying webhook signature...');
    
    let event;
    
    if (webhookSecret) {
      // 生产环境：验证签名
      event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
    } else {
      // 开发环境：跳过验证（仅用于测试）
      event = JSON.parse(payload);
      console.log('⚠️ Skipping signature verification (development mode)');
    }

    console.log('✅ Event received, type:', event.type);

    // ✅ 处理事件
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('💰 Checkout completed:', session.id);
      
      // 获取客户邮箱和金额
      const customerEmail = session.customer_email || session.customer_details?.email;
      const amount = session.amount_total || 0;
      
      // 测试环境发给您，生产环境发给客户
      const emailTo = process.env.NODE_ENV === 'production' 
        ? customerEmail || 'lix771859@gmail.com'
        : 'lix771859@gmail.com';
      
      console.log('📧 准备发送邮件到:', emailTo);
      await sendPaymentSuccessEmail(emailTo, amount, session.id);
    }

    console.log('📤 Sending response');
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('❌ Webhook error:', error.message);
    console.error('Full error:', error);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }
}