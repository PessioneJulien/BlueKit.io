-- Community Components Tables
-- This migration creates tables for the community components system

-- Create components table
CREATE TABLE IF NOT EXISTS components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('frontend', 'backend', 'database', 'devops', 'mobile', 'ai', 'tool', 'other')),
  type VARCHAR(10) NOT NULL CHECK (type IN ('main', 'sub')),
  setup_time_hours INTEGER NOT NULL DEFAULT 1,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'expert')),
  pricing VARCHAR(20) NOT NULL CHECK (pricing IN ('free', 'freemium', 'paid')),
  documentation TEXT,
  official_docs_url VARCHAR(500),
  github_url VARCHAR(500),
  npm_url VARCHAR(500),
  logo_url VARCHAR(500),
  tags TEXT[] DEFAULT '{}',
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_official BOOLEAN DEFAULT false,
  compatible_with TEXT[] DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create component reviews table
CREATE TABLE IF NOT EXISTS component_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID REFERENCES components(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating DECIMAL(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  criteria JSONB DEFAULT '{}', -- {"documentation": 4, "easeOfUse": 5, "performance": 4, "support": 3}
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(component_id, user_id) -- One review per user per component
);

-- Create component review votes table (for helpful/not helpful)
CREATE TABLE IF NOT EXISTS component_review_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES component_reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('helpful', 'not_helpful')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(review_id, user_id) -- One vote per user per review
);

-- Create component usage tracking table
CREATE TABLE IF NOT EXISTS component_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID REFERENCES components(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  stack_id UUID, -- Reference to stacks table when implemented
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_components_category ON components(category);
CREATE INDEX IF NOT EXISTS idx_components_type ON components(type);
CREATE INDEX IF NOT EXISTS idx_components_author ON components(author_id);
CREATE INDEX IF NOT EXISTS idx_components_created_at ON components(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_components_usage_count ON components(usage_count DESC);

CREATE INDEX IF NOT EXISTS idx_component_reviews_component ON component_reviews(component_id);
CREATE INDEX IF NOT EXISTS idx_component_reviews_user ON component_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_component_reviews_rating ON component_reviews(rating DESC);

CREATE INDEX IF NOT EXISTS idx_component_usage_component ON component_usage(component_id);
CREATE INDEX IF NOT EXISTS idx_component_usage_user ON component_usage(user_id);

-- Create function to update component usage count
CREATE OR REPLACE FUNCTION update_component_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE components 
  SET usage_count = (
    SELECT COUNT(*) 
    FROM component_usage 
    WHERE component_id = NEW.component_id
  )
  WHERE id = NEW.component_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update usage count
CREATE TRIGGER trigger_update_component_usage_count
  AFTER INSERT ON component_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_component_usage_count();

-- Create function to update review helpful counts
CREATE OR REPLACE FUNCTION update_review_helpful_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'helpful' THEN
      UPDATE component_reviews 
      SET helpful_count = helpful_count + 1 
      WHERE id = NEW.review_id;
    ELSIF NEW.vote_type = 'not_helpful' THEN
      UPDATE component_reviews 
      SET not_helpful_count = not_helpful_count + 1 
      WHERE id = NEW.review_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle vote change
    IF OLD.vote_type = 'helpful' AND NEW.vote_type = 'not_helpful' THEN
      UPDATE component_reviews 
      SET helpful_count = helpful_count - 1, not_helpful_count = not_helpful_count + 1 
      WHERE id = NEW.review_id;
    ELSIF OLD.vote_type = 'not_helpful' AND NEW.vote_type = 'helpful' THEN
      UPDATE component_reviews 
      SET helpful_count = helpful_count + 1, not_helpful_count = not_helpful_count - 1 
      WHERE id = NEW.review_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'helpful' THEN
      UPDATE component_reviews 
      SET helpful_count = helpful_count - 1 
      WHERE id = OLD.review_id;
    ELSIF OLD.vote_type = 'not_helpful' THEN
      UPDATE component_reviews 
      SET not_helpful_count = not_helpful_count - 1 
      WHERE id = OLD.review_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for review vote counts
CREATE TRIGGER trigger_update_review_helpful_counts
  AFTER INSERT OR UPDATE OR DELETE ON component_review_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpful_counts();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER trigger_components_updated_at
  BEFORE UPDATE ON components
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_component_reviews_updated_at
  BEFORE UPDATE ON component_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for components table
CREATE POLICY "Components are viewable by everyone" ON components
  FOR SELECT USING (true);

CREATE POLICY "Users can create components" ON components
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own components" ON components
  FOR UPDATE USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own components" ON components
  FOR DELETE USING (auth.uid() = author_id);

-- RLS Policies for component_reviews table
CREATE POLICY "Reviews are viewable by everyone" ON component_reviews
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON component_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON component_reviews
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON component_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for component_review_votes table
CREATE POLICY "Review votes are viewable by everyone" ON component_review_votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote on reviews" ON component_review_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" ON component_review_votes
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes" ON component_review_votes
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for component_usage table
CREATE POLICY "Component usage is viewable by everyone" ON component_usage
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can track component usage" ON component_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Insert some seed data for popular components
INSERT INTO components (name, description, category, type, setup_time_hours, difficulty, pricing, official_docs_url, github_url, npm_url, tags, is_official, compatible_with) VALUES 
('React', 'A JavaScript library for building user interfaces', 'frontend', 'main', 2, 'intermediate', 'free', 'https://react.dev/', 'https://github.com/facebook/react', 'https://www.npmjs.com/package/react', ARRAY['ui', 'library', 'javascript', 'typescript'], true, ARRAY['nextjs', 'vite', 'webpack']),
('Vue.js', 'The Progressive JavaScript Framework', 'frontend', 'main', 2, 'beginner', 'free', 'https://vuejs.org/', 'https://github.com/vuejs/vue', 'https://www.npmjs.com/package/vue', ARRAY['ui', 'framework', 'javascript'], true, ARRAY['nuxt', 'vite']),
('Angular', 'Platform for building mobile and desktop web applications', 'frontend', 'main', 4, 'expert', 'free', 'https://angular.io/', 'https://github.com/angular/angular', 'https://www.npmjs.com/package/@angular/core', ARRAY['framework', 'typescript', 'enterprise'], true, ARRAY[]::TEXT[]),
('Express.js', 'Fast, unopinionated, minimalist web framework for Node.js', 'backend', 'main', 1, 'intermediate', 'free', 'https://expressjs.com/', 'https://github.com/expressjs/express', 'https://www.npmjs.com/package/express', ARRAY['nodejs', 'server', 'api', 'rest'], true, ARRAY['mongodb', 'postgresql', 'redis']),
('Next.js', 'The React Framework for Production', 'frontend', 'main', 3, 'intermediate', 'free', 'https://nextjs.org/', 'https://github.com/vercel/next.js', 'https://www.npmjs.com/package/next', ARRAY['react', 'ssr', 'framework'], true, ARRAY['react', 'tailwindcss', 'supabase']),
('Tailwind CSS', 'A utility-first CSS framework', 'frontend', 'sub', 1, 'beginner', 'free', 'https://tailwindcss.com/', 'https://github.com/tailwindlabs/tailwindcss', 'https://www.npmjs.com/package/tailwindcss', ARRAY['css', 'styling', 'utility-first'], true, ARRAY['react', 'vue', 'nextjs']);