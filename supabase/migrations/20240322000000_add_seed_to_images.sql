-- 添加 seed 字段到 images 表
ALTER TABLE images ADD COLUMN IF NOT EXISTS seed INTEGER; 