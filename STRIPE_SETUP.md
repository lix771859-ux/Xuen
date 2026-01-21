# Stripe 集成指南

## 设置步骤

### 1. 安装依赖
```bash
npm install stripe @stripe/stripe-js
```

### 2. 配置环境变量
创建 `.env.local` 文件并添加以下内容：

```env
# Stripe 密钥 (从 https://dashboard.stripe.com/apikeys 获取)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key

# Stripe Webhook 密钥 (可选)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# 应用 URL
NEXT_PUBLIC_APP_URL=https://localhost:3000
```

### 3. 获取 Stripe 密钥
1. 访问 [Stripe Dashboard](https://dashboard.stripe.com/register)
2. 创建账户或登录
3. 在开发者页面获取测试密钥

### 4. 测试支付
访问 `https://localhost:3000/payment` 测试支付功能

## 文件结构

```
src/lib/
  ├── stripe.ts              # 服务端 Stripe 实例
  └── stripe-client.ts       # 客户端 Stripe 实例

app/api/stripe/
  ├── create-payment-intent/  # 创建支付意图
  ├── create-checkout-session/ # 创建 Checkout 会话
  └── webhook/                # Webhook 处理

app/payment/
  ├── page.tsx               # 支付页面
  ├── success/page.tsx       # 支付成功页面
  └── cancel/page.tsx        # 支付取消页面
```

## API 使用示例

### 创建支付意图
```typescript
const response = await fetch('/api/stripe/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount: 10, currency: 'usd' })
});
const { clientSecret } = await response.json();
```

### 创建 Checkout 会话
```typescript
const response = await fetch('/api/stripe/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    priceId: 'price_xxx',
    successUrl: '/payment/success',
    cancelUrl: '/payment/cancel'
  })
});
const { url } = await response.json();
window.location.href = url; // 重定向到 Stripe Checkout
```

## Webhook 设置

### 本地开发
1. 安装 Stripe CLI: https://stripe.com/docs/stripe-cli
2. 运行: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. 复制 webhook 签名密钥到 `.env.local`

### 生产环境
1. 在 Stripe Dashboard 添加 webhook 端点: `https://yourdomain.com/api/stripe/webhook`
2. 选择要监听的事件
3. 复制 webhook 签名密钥

## 常用测试卡号

```
成功支付: 4242 4242 4242 4242
需要验证: 4000 0025 0000 3155
支付失败: 4000 0000 0000 9995

过期日期: 任何未来日期
CVC: 任何3位数字
```

## 下一步

- 集成 [Stripe Elements](https://stripe.com/docs/payments/elements) 用于自定义支付表单
- 实现订阅功能
- 处理退款和争议
- 添加客户管理
