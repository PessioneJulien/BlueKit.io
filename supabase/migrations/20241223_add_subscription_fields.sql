-- Add subscription fields to user_profiles table
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(255),
ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_customer_id 
ON user_profiles(stripe_customer_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_subscription_id 
ON user_profiles(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status 
ON user_profiles(subscription_status);

-- Create a table to track usage and limits
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stack_count INTEGER DEFAULT 0,
  components_used INTEGER DEFAULT 0,
  exports_count INTEGER DEFAULT 0,
  last_export_at TIMESTAMP WITH TIME ZONE,
  period_start TIMESTAMP WITH TIME ZONE DEFAULT DATE_TRUNC('month', NOW()),
  period_end TIMESTAMP WITH TIME ZONE DEFAULT DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period_start)
);

-- Create function to check subscription limits
CREATE OR REPLACE FUNCTION check_subscription_limit(
  p_user_id UUID,
  p_limit_type TEXT,
  p_current_count INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_subscription_plan VARCHAR;
  v_limit INTEGER;
BEGIN
  -- Get user's subscription plan
  SELECT subscription_plan INTO v_subscription_plan
  FROM user_profiles
  WHERE user_id = p_user_id;
  
  -- Set limits based on plan
  CASE v_subscription_plan
    WHEN 'free' THEN
      CASE p_limit_type
        WHEN 'stacks' THEN v_limit := 3;
        WHEN 'components' THEN v_limit := 10;
        WHEN 'exports' THEN v_limit := 5;
        ELSE v_limit := 0;
      END CASE;
    WHEN 'starter' THEN
      CASE p_limit_type
        WHEN 'stacks' THEN v_limit := 10;
        WHEN 'components' THEN v_limit := 25;
        WHEN 'exports' THEN v_limit := 50;
        ELSE v_limit := 0;
      END CASE;
    WHEN 'professional', 'enterprise' THEN
      v_limit := -1; -- Unlimited
    ELSE
      -- Default to free limits
      CASE p_limit_type
        WHEN 'stacks' THEN v_limit := 3;
        WHEN 'components' THEN v_limit := 10;
        WHEN 'exports' THEN v_limit := 5;
        ELSE v_limit := 0;
      END CASE;
  END CASE;
  
  -- Return true if unlimited or under limit
  RETURN v_limit = -1 OR p_current_count < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS policies for user_usage
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage"
  ON user_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
  ON user_usage FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
  ON user_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);