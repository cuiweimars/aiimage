-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create referral_codes table
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referrals table to track successful referrals
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, completed, rewarded
  reward_type VARCHAR(50),
  reward_amount INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referred_id) -- Each user can only be referred once
);

-- Create referral_rewards table to track rewards history
CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referral_id UUID REFERENCES referrals(id) ON DELETE SET NULL,
  reward_type VARCHAR(50) NOT NULL,
  reward_amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add referral_code field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_quota_bonus INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_user_id ON referral_rewards(user_id);

-- Row Level Security policies
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own referral codes" 
  ON referral_codes 
  FOR SELECT 
  USING (auth.uid() = user_id);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view referrals they've made" 
  ON referrals 
  FOR SELECT 
  USING (auth.uid() = referrer_id);

ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own rewards" 
  ON referral_rewards 
  FOR SELECT 
  USING (auth.uid() = user_id);
