// app/api/stripe/webhook/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sendPaymentSuccessEmail } from '@/src/lib/email';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET! as string, {
  apiVersion: '2025-12-15.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// 创建管理员权限的 Supabase 客户端（用于 webhook）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

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
    console.log('📋 Full event data:', JSON.stringify(event, null, 2));

    // ✅ 处理事件
    if (event.type === 'checkout.session.completed') {
      console.log('🎯 进入 checkout.session.completed 处理逻辑');
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('💰 Checkout completed:', session.id);
      
      // 获取客户邮箱和金额
      const customerEmail = session.customer_email || session.customer_details?.email;
      const amount = session.amount_total || 0;
      
      // 💾 保存到数据库
      try {
        const { data, error } = await supabaseAdmin
          .from('payments')
          .insert({
            stripe_session_id: session.id,
            stripe_customer_id: session.customer,
            customer_email: customerEmail,
            amount: amount,
            currency: session.currency,
            status: 'completed',
            metadata: session.metadata || {},
          })
          .select()
          .single();
        
        if (error) {
          console.error('❌ 保存支付记录失败:', error);
        } else {
          console.log('✅ 支付记录已保存:', data.id);
        }
      } catch (dbError) {
        console.error('❌ 数据库错误:', dbError);
      }
      
      // 📧 发送邮件（同步等待，确保完成）
      const emailTo = process.env.NODE_ENV === 'production' 
        ? customerEmail || 'lix771859@gmail.com'
        : 'lix771859@gmail.com';
      
      console.log('📧 准备发送邮件到:', emailTo);
      
      try {
        await sendPaymentSuccessEmail(emailTo, amount, session.id);
        console.log('✅ 邮件发送成功');
      } catch (emailError) {
        console.error('❌ 邮件发送失败:', emailError);
      }
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