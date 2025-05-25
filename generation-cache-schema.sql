-- 创建图像生成缓存表
CREATE TABLE IF NOT EXISTS generation_cache (
  cache_key TEXT PRIMARY KEY,
  params JSONB NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  access_count INTEGER NOT NULL DEFAULT 1
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_generation_cache_created_at ON generation_cache(created_at);

-- 创建函数以清理过期缓存
CREATE OR REPLACE FUNCTION clean_expired_generation_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM generation_cache
  WHERE created_at < NOW() - INTERVAL '7 days'
  RETURNING COUNT(*) INTO deleted_count;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器以在插入新记录时更新访问计数
CREATE OR REPLACE FUNCTION update_generation_cache_access_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- 对于新记录，不需要更新访问计数
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- 更新访问计数
    NEW.access_count := OLD.access_count + 1;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generation_cache_access_count_trigger
BEFORE UPDATE ON generation_cache
FOR EACH ROW
EXECUTE FUNCTION update_generation_cache_access_count();
