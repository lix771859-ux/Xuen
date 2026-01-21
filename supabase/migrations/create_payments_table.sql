-- 创建支付记录表
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  customer_email TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'completed',
  metadata JSONB
);

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_session_id ON payments(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- 启用行级安全
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的支付记录
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- 插入权限（通过 service role）
CREATE POLICY "Service role can insert payments" ON payments
  FOR INSERT
  WITH CHECK (true);
