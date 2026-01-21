// src/lib/email.ts
import nodemailer from 'nodemailer';

// 创建邮件发送器
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.resend.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPaymentSuccessEmail(
  customerEmail: string,
  amount: number,
  sessionId: string
) {
  try {
    const info = await transporter.sendMail({
      from: 'onboarding@resend.dev', // Resend 官方测试邮箱
      to: customerEmail,
      subject: '支付成功确认 ✅',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">支付成功！</h2>
          <p>您好，</p>
          <p>感谢您的支付！以下是交易详情：</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>金额：</strong> $${(amount / 100).toFixed(2)}</p>
            <p><strong>交易ID：</strong> ${sessionId}</p>
            <p><strong>时间：</strong> ${new Date().toLocaleString('zh-CN')}</p>
          </div>
          <p>如有任何问题，请随时联系我们。</p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          <p style="color: #6B7280; font-size: 12px;">
            此邮件由系统自动发送，请勿回复。
          </p>
        </div>
      `,
    });

    console.log('📧 邮件发送成功:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('📧 邮件发送失败:', error.message);
    return { success: false, error: error.message };
  }
}
