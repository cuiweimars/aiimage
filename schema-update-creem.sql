-- 添加 creem_customer_id 列到 users 表
-- Add creem_customer_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS creem_customer_id TEXT;

-- 添加 r2_file_key 列到 images 表（如果之前没有添加）
-- Add r2_file_key column to images table (if not added previously)
ALTER TABLE images ADD COLUMN IF NOT EXISTS r2_file_key TEXT;
