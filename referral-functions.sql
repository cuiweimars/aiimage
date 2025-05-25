-- Function to issue a referral reward in a transaction
CREATE OR REPLACE FUNCTION issue_referral_reward(
  p_referral_id UUID,
  p_reward_type VARCHAR,
  p_reward_amount INTEGER,
  p_description TEXT
) RETURNS VOID AS $$
DECLARE
  v_referrer_id UUID;
BEGIN
  -- Get the referrer ID
  SELECT referrer_id INTO v_referrer_id
  FROM referrals
  WHERE id = p_referral_id;
  
  IF v_referrer_id IS NULL THEN
    RAISE EXCEPTION 'Referral not found';
  END IF;
  
  -- Update the referral status and reward info
  UPDATE referrals
  SET 
    status = 'rewarded',
    reward_type = p_reward_type,
    reward_amount = p_reward_amount,
    updated_at = NOW()
  WHERE id = p_referral_id;
  
  -- Create a reward record
  INSERT INTO referral_rewards (
    user_id,
    referral_id,
    reward_type,
    reward_amount,
    description
  ) VALUES (
    v_referrer_id,
    p_referral_id,
    p_reward_type,
    p_reward_amount,
    p_description
  );
  
  -- If the reward is a quota bonus, update the user's quota bonus
  IF p_reward_type = 'quota' THEN
    UPDATE users
    SET referral_quota_bonus = referral_quota_bonus + p_reward_amount
    WHERE id = v_referrer_id;
  END IF;
  
  -- Additional reward types can be handled here
END;
$$ LANGUAGE plpgsql;

-- Function to check if a user was referred and process the referral
CREATE OR REPLACE FUNCTION process_user_referral(
  p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_referral_id UUID;
  v_referrer_id UUID;
BEGIN
  -- Get the user's referrer
  SELECT referred_by INTO v_referrer_id
  FROM users
  WHERE id = p_user_id;
  
  IF v_referrer_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get the pending referral
  SELECT id INTO v_referral_id
  FROM referrals
  WHERE referrer_id = v_referrer_id
  AND referred_id = p_user_id
  AND status = 'pending';
  
  IF v_referral_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update the referral to completed
  UPDATE referrals
  SET 
    status = 'completed',
    updated_at = NOW()
  WHERE id = v_referral_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically reward completed referrals
CREATE OR REPLACE FUNCTION auto_reward_completed_referrals() RETURNS VOID AS $$
DECLARE
  v_referral RECORD;
BEGIN
  FOR v_referral IN 
    SELECT id, referrer_id
    FROM referrals
    WHERE status = 'completed'
  LOOP
    -- Issue a standard quota reward
    PERFORM issue_referral_reward(
      v_referral.id,
      'quota',
      10, -- 10 extra generations
      'Referral bonus: +10 daily generations'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;
