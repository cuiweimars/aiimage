-- 创建集合表
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建集合图像关联表
CREATE TABLE IF NOT EXISTS collection_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(collection_id, image_id)
);

-- 创建索引
CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_collection_images_collection_id ON collection_images(collection_id);
CREATE INDEX idx_collection_images_image_id ON collection_images(image_id);
