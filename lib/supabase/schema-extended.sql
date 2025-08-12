-- Extended database schema with rating and review system
-- This builds upon the existing schema.sql

-- Create stack_ratings table for user reviews of stacks
CREATE TABLE IF NOT EXISTS stack_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stack_id UUID NOT NULL REFERENCES stacks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  criteria JSONB, -- {"documentation": 4, "ease_of_use": 5, "performance": 3, "support": 4}
  is_verified BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Ensure one review per user per stack
  UNIQUE(stack_id, user_id)
);

-- Create stack_rating_votes table for voting on reviews
CREATE TABLE IF NOT EXISTS stack_rating_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rating_id UUID NOT NULL REFERENCES stack_ratings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('helpful', 'not_helpful')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Ensure one vote per user per rating
  UNIQUE(rating_id, user_id)
);

-- Create technologies table for the tech components
CREATE TABLE IF NOT EXISTS technologies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('frontend', 'backend', 'database', 'devops', 'mobile', 'ai', 'tool', 'other')),
  type VARCHAR(20) NOT NULL CHECK (type IN ('main', 'sub')),
  setup_time_hours INTEGER NOT NULL CHECK (setup_time_hours > 0),
  difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'expert')),
  pricing VARCHAR(50) NOT NULL CHECK (pricing IN ('free', 'freemium', 'paid')),
  documentation TEXT,
  official_docs_url VARCHAR(500),
  github_url VARCHAR(500),
  npm_url VARCHAR(500),
  logo_url VARCHAR(500),
  tags TEXT[],
  author_id UUID REFERENCES auth.users(id),
  is_official BOOLEAN DEFAULT false,
  compatible_with TEXT[],
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create technology_ratings table
CREATE TABLE IF NOT EXISTS technology_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  technology_id UUID NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  criteria JSONB, -- {"documentation": 4, "ease_of_use": 5, "performance": 3, "support": 4}
  is_verified BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Ensure one review per user per technology
  UNIQUE(technology_id, user_id)
);

-- Create technology_rating_votes table
CREATE TABLE IF NOT EXISTS technology_rating_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rating_id UUID NOT NULL REFERENCES technology_ratings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('helpful', 'not_helpful')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Ensure one vote per user per rating
  UNIQUE(rating_id, user_id)
);

-- Create technology_usage_stats table
CREATE TABLE IF NOT EXISTS technology_usage_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  technology_id UUID NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  session_id VARCHAR(255),
  used_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create user_profiles table to extend auth.users
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(100),
  avatar_url VARCHAR(500),
  subscription_status VARCHAR(20) DEFAULT 'free' CHECK (subscription_status IN ('free', 'pro', 'enterprise')),
  subscription_id VARCHAR(255),
  customer_id VARCHAR(255),
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create audit_logs table for tracking changes
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stack_ratings_stack_id ON stack_ratings(stack_id);
CREATE INDEX IF NOT EXISTS idx_stack_ratings_user_id ON stack_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_stack_ratings_rating ON stack_ratings(rating);
CREATE INDEX IF NOT EXISTS idx_stack_ratings_created_at ON stack_ratings(created_at);

CREATE INDEX IF NOT EXISTS idx_stack_rating_votes_rating_id ON stack_rating_votes(rating_id);
CREATE INDEX IF NOT EXISTS idx_stack_rating_votes_user_id ON stack_rating_votes(user_id);

CREATE INDEX IF NOT EXISTS idx_technologies_category ON technologies(category);
CREATE INDEX IF NOT EXISTS idx_technologies_difficulty ON technologies(difficulty);
CREATE INDEX IF NOT EXISTS idx_technologies_pricing ON technologies(pricing);
CREATE INDEX IF NOT EXISTS idx_technologies_is_official ON technologies(is_official);
CREATE INDEX IF NOT EXISTS idx_technologies_name ON technologies(name);

CREATE INDEX IF NOT EXISTS idx_technology_ratings_technology_id ON technology_ratings(technology_id);
CREATE INDEX IF NOT EXISTS idx_technology_ratings_user_id ON technology_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_technology_ratings_rating ON technology_ratings(rating);

CREATE INDEX IF NOT EXISTS idx_technology_usage_stats_technology_id ON technology_usage_stats(technology_id);
CREATE INDEX IF NOT EXISTS idx_technology_usage_stats_used_at ON technology_usage_stats(used_at);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_status ON user_profiles(subscription_status);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Enable Row Level Security for new tables
ALTER TABLE stack_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stack_rating_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE technology_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE technology_rating_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE technology_usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stack_ratings
CREATE POLICY "Public can view stack ratings" ON stack_ratings FOR SELECT USING (true);
CREATE POLICY "Users can create their own stack ratings" ON stack_ratings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stack ratings" ON stack_ratings FOR UPDATE 
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own stack ratings" ON stack_ratings FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for stack_rating_votes
CREATE POLICY "Users can manage their own rating votes" ON stack_rating_votes FOR ALL 
  USING (auth.uid() = user_id);

-- RLS Policies for technologies
CREATE POLICY "Public can view technologies" ON technologies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create technologies" ON technologies FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own technologies" ON technologies FOR UPDATE 
  USING (auth.uid() = author_id OR auth.email() = 'julien.pessione83@gmail.com');
CREATE POLICY "Users can delete their own technologies" ON technologies FOR DELETE 
  USING (auth.uid() = author_id OR auth.email() = 'julien.pessione83@gmail.com');

-- RLS Policies for technology_ratings
CREATE POLICY "Public can view technology ratings" ON technology_ratings FOR SELECT USING (true);
CREATE POLICY "Users can create their own technology ratings" ON technology_ratings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own technology ratings" ON technology_ratings FOR UPDATE 
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own technology ratings" ON technology_ratings FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for technology_rating_votes
CREATE POLICY "Users can manage their own tech rating votes" ON technology_rating_votes FOR ALL 
  USING (auth.uid() = user_id);

-- RLS Policies for technology_usage_stats
CREATE POLICY "Anyone can track technology usage" ON technology_usage_stats FOR INSERT 
  WITH CHECK (true);
CREATE POLICY "Public can view usage stats" ON technology_usage_stats FOR SELECT USING (true);

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT 
  USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE 
  USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- RLS Policies for audit_logs
CREATE POLICY "Admin can view audit logs" ON audit_logs FOR SELECT 
  USING (auth.email() = 'julien.pessione83@gmail.com');
CREATE POLICY "System can create audit logs" ON audit_logs FOR INSERT 
  WITH CHECK (true);

-- Functions to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_stack_ratings_updated_at BEFORE UPDATE ON stack_ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_technologies_updated_at BEFORE UPDATE ON technologies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_technology_ratings_updated_at BEFORE UPDATE ON technology_ratings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update rating counts when votes are added/removed
CREATE OR REPLACE FUNCTION update_rating_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'stack_rating_votes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE stack_ratings 
      SET 
        helpful_count = (
          SELECT COUNT(*) FROM stack_rating_votes 
          WHERE rating_id = NEW.rating_id AND vote_type = 'helpful'
        ),
        not_helpful_count = (
          SELECT COUNT(*) FROM stack_rating_votes 
          WHERE rating_id = NEW.rating_id AND vote_type = 'not_helpful'
        )
      WHERE id = NEW.rating_id;
      RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
      UPDATE stack_ratings 
      SET 
        helpful_count = (
          SELECT COUNT(*) FROM stack_rating_votes 
          WHERE rating_id = NEW.rating_id AND vote_type = 'helpful'
        ),
        not_helpful_count = (
          SELECT COUNT(*) FROM stack_rating_votes 
          WHERE rating_id = NEW.rating_id AND vote_type = 'not_helpful'
        )
      WHERE id = NEW.rating_id;
      RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE stack_ratings 
      SET 
        helpful_count = (
          SELECT COUNT(*) FROM stack_rating_votes 
          WHERE rating_id = OLD.rating_id AND vote_type = 'helpful'
        ),
        not_helpful_count = (
          SELECT COUNT(*) FROM stack_rating_votes 
          WHERE rating_id = OLD.rating_id AND vote_type = 'not_helpful'
        )
      WHERE id = OLD.rating_id;
      RETURN OLD;
    END IF;
  ELSIF TG_TABLE_NAME = 'technology_rating_votes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE technology_ratings 
      SET 
        helpful_count = (
          SELECT COUNT(*) FROM technology_rating_votes 
          WHERE rating_id = NEW.rating_id AND vote_type = 'helpful'
        ),
        not_helpful_count = (
          SELECT COUNT(*) FROM technology_rating_votes 
          WHERE rating_id = NEW.rating_id AND vote_type = 'not_helpful'
        )
      WHERE id = NEW.rating_id;
      RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
      UPDATE technology_ratings 
      SET 
        helpful_count = (
          SELECT COUNT(*) FROM technology_rating_votes 
          WHERE rating_id = NEW.rating_id AND vote_type = 'helpful'
        ),
        not_helpful_count = (
          SELECT COUNT(*) FROM technology_rating_votes 
          WHERE rating_id = NEW.rating_id AND vote_type = 'not_helpful'
        )
      WHERE id = NEW.rating_id;
      RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE technology_ratings 
      SET 
        helpful_count = (
          SELECT COUNT(*) FROM technology_rating_votes 
          WHERE rating_id = OLD.rating_id AND vote_type = 'helpful'
        ),
        not_helpful_count = (
          SELECT COUNT(*) FROM technology_rating_votes 
          WHERE rating_id = OLD.rating_id AND vote_type = 'not_helpful'
        )
      WHERE id = OLD.rating_id;
      RETURN OLD;
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Create triggers for vote count updates
CREATE TRIGGER update_stack_rating_vote_counts
  AFTER INSERT OR UPDATE OR DELETE ON stack_rating_votes
  FOR EACH ROW EXECUTE FUNCTION update_rating_vote_counts();

CREATE TRIGGER update_technology_rating_vote_counts
  AFTER INSERT OR UPDATE OR DELETE ON technology_rating_votes
  FOR EACH ROW EXECUTE FUNCTION update_rating_vote_counts();

-- Function to update usage counts
CREATE OR REPLACE FUNCTION update_usage_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'technology_usage_stats' THEN
    UPDATE technologies 
    SET usage_count = usage_count + 1 
    WHERE id = NEW.technology_id;
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Create trigger for technology usage count updates
CREATE TRIGGER update_technology_usage_count
  AFTER INSERT ON technology_usage_stats
  FOR EACH ROW EXECUTE FUNCTION update_usage_counts();

-- Create views for common queries
CREATE OR REPLACE VIEW stack_ratings_with_user AS
SELECT 
  sr.*,
  up.name as user_name,
  up.avatar_url as user_avatar
FROM stack_ratings sr
LEFT JOIN user_profiles up ON sr.user_id = up.id;

CREATE OR REPLACE VIEW technology_ratings_with_user AS
SELECT 
  tr.*,
  up.name as user_name,
  up.avatar_url as user_avatar
FROM technology_ratings tr
LEFT JOIN user_profiles up ON tr.user_id = up.id;

-- Create materialized view for stack statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS stack_statistics AS
SELECT 
  s.id,
  s.name,
  s.category,
  COUNT(sr.id) as rating_count,
  COALESCE(AVG(sr.rating), 0) as average_rating,
  COUNT(sus.id) as usage_count
FROM stacks s
LEFT JOIN stack_ratings sr ON s.id = sr.stack_id
LEFT JOIN stack_usage_stats sus ON s.id = sus.stack_id
GROUP BY s.id, s.name, s.category;

-- Create unique index for materialized view
CREATE UNIQUE INDEX IF NOT EXISTS stack_statistics_id_idx ON stack_statistics(id);

-- Create materialized view for technology statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS technology_statistics AS
SELECT 
  t.id,
  t.name,
  t.category,
  COUNT(tr.id) as rating_count,
  COALESCE(AVG(tr.rating), 0) as average_rating,
  t.usage_count
FROM technologies t
LEFT JOIN technology_ratings tr ON t.id = tr.technology_id
GROUP BY t.id, t.name, t.category, t.usage_count;

-- Create unique index for materialized view
CREATE UNIQUE INDEX IF NOT EXISTS technology_statistics_id_idx ON technology_statistics(id);

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_statistics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY stack_statistics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY technology_statistics;
END;
$$ language 'plpgsql';

COMMENT ON TABLE stack_ratings IS 'User reviews and ratings for stacks';
COMMENT ON TABLE stack_rating_votes IS 'Votes on stack reviews (helpful/not helpful)';
COMMENT ON TABLE technologies IS 'Individual technologies/tools/frameworks';
COMMENT ON TABLE technology_ratings IS 'User reviews and ratings for technologies';
COMMENT ON TABLE technology_rating_votes IS 'Votes on technology reviews';
COMMENT ON TABLE technology_usage_stats IS 'Usage tracking for technologies';
COMMENT ON TABLE user_profiles IS 'Extended user profile information';
COMMENT ON TABLE audit_logs IS 'Audit trail for important actions';
COMMENT ON MATERIALIZED VIEW stack_statistics IS 'Cached statistics for stacks';
COMMENT ON MATERIALIZED VIEW technology_statistics IS 'Cached statistics for technologies';