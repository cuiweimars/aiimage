-- 创建博客评论表
CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_blog_comments_post_id ON blog_comments(post_id);
CREATE INDEX idx_blog_comments_user_id ON blog_comments(user_id);
CREATE INDEX idx_blog_comments_status ON blog_comments(status);

-- 添加一些示例评论
INSERT INTO blog_comments (post_id, author_name, author_email, content, status) 
SELECT 
  id as post_id,
  '张三',
  'zhangsan@example.com',
  '非常棒的文章，我学到了很多关于AI图像生成的知识！',
  'approved'
FROM blog_posts
WHERE slug = 'future-trends-in-ai-image-generation';

INSERT INTO blog_comments (post_id, author_name, author_email, content, status) 
SELECT 
  id as post_id,
  '李四',
  'lisi@example.com',
  '这些提示技巧对我帮助很大，我的AI生成图像质量提高了不少。',
  'approved'
FROM blog_posts
WHERE slug = 'how-to-use-prompt-engineering-to-improve-ai-image-quality';
