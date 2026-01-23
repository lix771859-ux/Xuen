-- 创建 articles 表
CREATE TABLE IF NOT EXISTS public.articles (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT
);

-- 启用 Row Level Security
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- 创建策略：所有已认证用户可以读取
CREATE POLICY "Allow authenticated users to read articles"
  ON public.articles
  FOR SELECT
  TO authenticated
  USING (true);

-- 创建策略：所有已认证用户可以插入
CREATE POLICY "Allow authenticated users to insert articles"
  ON public.articles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 创建策略：所有已认证用户可以更新
CREATE POLICY "Allow authenticated users to update articles"
  ON public.articles
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 创建策略：所有已认证用户可以删除
CREATE POLICY "Allow authenticated users to delete articles"
  ON public.articles
  FOR DELETE
  TO authenticated
  USING (true);

-- 创建 views 表（如果需要）
CREATE TABLE IF NOT EXISTS public.views (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT
);

ALTER TABLE public.views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read views"
  ON public.views
  FOR SELECT
  TO authenticated
  USING (true);
