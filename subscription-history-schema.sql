-- 创建订阅历史表
-- Create subscription history table
CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subscription_id TEXT NOT NULL,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  event_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
-- Create index
CREATE INDEX idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX idx_subscription_history_created_at ON subscription_history(created_at);

-- 添加 Row Level Security
-- Add Row Level Security
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- 创建策略
-- Create policies
CREATE POLICY "Users can view their own subscription history" 
  ON subscription_history 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- 添加 creem_customer_id 列到 users 表
-- Add creem_customer_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS creem_customer_id TEXT;
