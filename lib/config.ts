export const config = {
  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
    publicUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    publicAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  replicate: {
    apiToken: process.env.REPLICATE_API_TOKEN!,
    apiUrl: process.env.REPLICATE_API_URL!,
  },
  creem: {
    apiKey: process.env.CREEM_API_KEY!,
    apiUrl: process.env.CREEM_API_URL!,
  },
  r2: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
    bucketName: process.env.CLOUDFLARE_R2_BUCKET,
  },
  auth: {
    nextAuthUrl: process.env.NEXTAUTH_URL!,
    nextAuthSecret: process.env.NEXTAUTH_SECRET!,
    googleClientId: process.env.GOOGLE_CLIENT_ID!,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    githubClientId: process.env.GITHUB_CLIENT_ID!,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET!,
  },
}

export const PADDLE_API_KEY = process.env.PADDLE_API_KEY || ''
export const PADDLE_VENDOR_ID = process.env.PADDLE_VENDOR_ID || ''
export const PADDLE_PRODUCT_ID = process.env.PADDLE_PRODUCT_ID || ''
export const PADDLE_PRICE_ID_MONTHLY = process.env.PADDLE_PRICE_ID_MONTHLY || ''
export const PADDLE_PRICE_ID_YEARLY = process.env.PADDLE_PRICE_ID_YEARLY || ''
export const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET || ''

// Paddle 订阅套餐配置
export const SUBSCRIPTION_PLANS = {
  basic: {
    month: {
      price: Number(process.env.NEXT_PUBLIC_PADDLE_BASIC_MONTH_PRICE) || 0,
      price_id: process.env.NEXT_PUBLIC_PADDLE_BASIC_MONTH_PRICE_ID || '',
    },
    year: {
      price: Number(process.env.NEXT_PUBLIC_PADDLE_BASIC_YEAR_PRICE) || 0,
      price_id: process.env.NEXT_PUBLIC_PADDLE_BASIC_YEAR_PRICE_ID || '',
    },
  },
  ultimate: {
    month: {
      price: Number(process.env.NEXT_PUBLIC_PADDLE_ULTIMATE_MONTH_PRICE) || 0,
      price_id: process.env.NEXT_PUBLIC_PADDLE_ULTIMATE_MONTH_PRICE_ID || '',
    },
    year: {
      price: Number(process.env.NEXT_PUBLIC_PADDLE_ULTIMATE_YEAR_PRICE) || 0,
      price_id: process.env.NEXT_PUBLIC_PADDLE_ULTIMATE_YEAR_PRICE_ID || '',
    },
  },
  enterprise: {
    month: {
      price: null,
      price_id: '',
    },
    year: {
      price: null,
      price_id: '',
    },
  },
}
