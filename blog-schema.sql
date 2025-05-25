-- 创建博客分类表
CREATE TABLE IF NOT EXISTS blog_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建博客文章表
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image TEXT,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加一些示例分类
INSERT INTO blog_categories (name, slug) VALUES
('AI 新闻', 'ai-news'),
('教程', 'tutorials'),
('灵感', 'inspiration'),
('技术', 'technology'),
('案例研究', 'case-studies');

-- 添加一些示例博客文章
INSERT INTO blog_posts (title, slug, excerpt, content, author, category, featured) VALUES
(
  'AI 图像生成的未来趋势',
  'future-trends-in-ai-image-generation',
  '探索AI图像生成技术的最新发展和未来趋势。从扩散模型到多模态AI，了解这一快速发展领域的最新进展。',
  '<p>人工智能图像生成技术在过去几年中取得了惊人的进步。从早期的GAN（生成对抗网络）到现在的扩散模型，我们见证了AI创造的图像质量和多样性的巨大飞跃。</p><h2>扩散模型的崛起</h2><p>扩散模型，如Stable Diffusion和DALL-E，已经成为当前AI图像生成的主导技术。这些模型通过逐步去噪过程生成图像，能够创建出令人惊叹的高质量视觉内容。</p><h2>多模态AI的整合</h2><p>未来的趋势指向多模态AI系统的发展，这些系统可以同时理解和生成文本、图像、音频甚至视频。这种整合将使创作过程更加流畅和直观。</p><h2>个性化和定制化</h2><p>随着技术的进步，我们将看到更多针对个人风格和偏好的定制化选项。用户将能够训练AI理解他们的独特美学，并生成符合特定风格的图像。</p><h2>实时生成和交互</h2><p>计算能力的提升将使实时图像生成成为可能，允许用户即时看到他们的创意成果，并进行交互式调整。</p><p>总之，AI图像生成的未来充满了令人兴奋的可能性。随着技术的不断发展，我们期待看到更多创新应用和令人惊叹的创意作品。</p>',
  '张明',
  'AI 新闻',
  true
),
(
  '如何使用提示工程提升AI图像质量',
  'how-to-use-prompt-engineering-to-improve-ai-image-quality',
  '学习提示工程的基础知识和高级技巧，以获得更好的AI生成图像。本教程将帮助您掌握创建有效提示的艺术。',
  '<p>提示工程是获得高质量AI生成图像的关键。一个精心设计的提示可以显著提高输出质量，而一个模糊或不完整的提示则可能导致令人失望的结果。</p><h2>提示的基本结构</h2><p>一个好的提示通常包含以下元素：</p><ul><li>主题：你想要生成什么</li><li>风格：艺术风格、摄影风格等</li><li>环境：场景、背景、照明条件</li><li>细节：颜色、材质、情绪等具体细节</li></ul><h2>使用具体的描述词</h2><p>避免使用模糊的形容词，如"好看的"或"漂亮的"。相反，使用具体的描述词，如"充满活力的"、"高对比度的"或"柔和的柔光照明"。</p><h2>参考艺术家和风格</h2><p>提及特定艺术家或风格可以帮助AI理解你想要的美学。例如，"梵高风格的星空"或"赛博朋克风格的城市景观"。</p><h2>使用权重和强调</h2><p>许多AI模型允许你对提示中的某些词语进行加权。通过增加重要元素的权重，你可以引导AI更加关注这些方面。</p><p>通过实践和实验，你将逐渐掌握提示工程的艺术，创造出令人惊叹的AI生成图像。</p>',
  '李华',
  '教程',
  false
),
(
  'AI艺术在现代设计中的应用',
  'applications-of-ai-art-in-modern-design',
  '探索AI生成艺术如何革新现代设计领域。从品牌标识到产品包装，AI正在改变设计师的工作方式。',
  '<p>人工智能生成的艺术正在彻底改变设计行业，为创意专业人士提供了前所未有的工具和可能性。</p><h2>品牌标识设计</h2><p>设计师现在可以使用AI生成数十甚至数百个标志概念，然后选择最佳选项进行细化。这大大加快了品牌标识设计的过程，同时提供了更多创意选择。</p><h2>产品包装</h2><p>AI可以生成独特的包装设计概念，帮助产品在货架上脱颖而出。设计师可以快速迭代不同的颜色方案、图案和布局，找到最吸引人的组合。</p><h2>网页和应用界面</h2><p>从背景图像到图标和插图，AI生成的视觉元素正在丰富数字界面设计。这些元素可以根据品牌风格定制，确保一致的用户体验。</p><h2>广告和营销材料</h2><p>营销人员使用AI生成引人注目的视觉内容，用于社交媒体、广告活动和其他营销渠道。这使他们能够以前所未有的速度创建和测试不同的创意概念。</p><p>随着AI技术的不断进步，我们可以期待看到更多创新的设计应用出现，进一步模糊人类创造力和人工智能之间的界限。</p>',
  '王芳',
  '案例研究',
  false
);
