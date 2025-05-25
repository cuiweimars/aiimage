# AI Image Generator

一个功能强大的AI图像生成Web应用,基于Next.js和现代Web技术栈构建。

## 功能特性

### 核心功能
- AI图像生成
  - 支持文本提示词生成图片
  - 支持上传参考图片(最多3张)
  - 多种图片尺寸和比例选择
  - 实时生成进度显示
  - 生成时间估算
  - 图片下载和分享功能

### 用户系统
- 完整的用户认证和授权
- 订阅计划管理
- 生成配额限制
- 个性化用户仪表板

### 技术特点
- 基于Next.js 13+ App Router构建
- TypeScript支持
- 响应式设计,支持移动端
- 国际化支持
- 现代化UI组件库
- 实时状态管理
- 完善的错误处理和重试机制

### 数据存储
- Supabase数据库
- Cloudflare R2图片存储
- 用户数据安全保护

## 技术栈

### 前端
- Next.js 15.2.4
- React 19
- TypeScript
- Tailwind CSS
- Radix UI组件库

### 后端
- Next.js API Routes
- Supabase数据库
- Cloudflare R2存储
- Supabase认证

### 开发工具
- TypeScript
- ESLint
- PostCSS
- Tailwind CSS

## 项目结构

```
├── app/                    # Next.js App Router
│   ├── [locale]/          # 国际化路由
│   ├── ai-lab/            # AI图像生成实验室
│   ├── api/               # API路由
│   ├── dashboard/         # 用户仪表板
│   ├── login/             # 登录页面
│   ├── register/          # 注册页面
│   ├── settings/          # 用户设置
│   └── pricing/           # 定价页面
├── components/            # React组件
├── lib/                   # 工具函数和库
├── hooks/                 # React自定义hooks
├── styles/               # 样式文件
└── public/               # 静态资源
```

## 数据库结构

### 用户表(users)
- id: UUID主键
- name: 用户名
- email: 邮箱
- password: 密码
- image: 头像
- bio: 个人简介
- created_at: 创建时间
- updated_at: 更新时间

### 图片表(images)
- id: UUID主键
- user_id: 用户ID
- prompt: 生成提示词
- image_url: 图片URL
- created_at: 创建时间
- updated_at: 更新时间

### 订阅表(subscriptions)
- id: UUID主键
- user_id: 用户ID
- plan: 订阅计划
- status: 订阅状态
- current_period_end: 当前周期结束时间
- created_at: 创建时间
- updated_at: 更新时间

## 安全特性

- 使用UUID作为主键
- 实现行级安全策略(RLS)
- 用户数据访问控制
- 图片访问权限管理
- 安全的文件上传处理

## 开发

1. 安装依赖
```bash
pnpm install
```

2. 运行开发服务器
```bash
pnpm dev
```

3. 构建生产版本
```bash
pnpm build
```

4. 启动生产服务器
```bash
pnpm start
```

## 环境变量

需要配置以下环境变量:

- SUPABASE_URL: Supabase项目URL
- SUPABASE_ANON_KEY: Supabase匿名密钥
- NEXT_PUBLIC_SUPABASE_URL: Supabase项目URL(公开)
- NEXT_PUBLIC_SUPABASE_ANON_KEY: Supabase匿名密钥(公开)
- R2_ACCOUNT_ID: Cloudflare R2账户ID
- R2_ACCESS_KEY_ID: Cloudflare R2访问密钥ID
- R2_SECRET_ACCESS_KEY: Cloudflare R2访问密钥
- R2_BUCKET_NAME: Cloudflare R2存储桶名称
- NEXTAUTH_SECRET: NextAuth密钥
- NEXTAUTH_URL: NextAuth URL

## 许可证

MIT 