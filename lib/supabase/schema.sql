-- Create stacks table
CREATE TABLE IF NOT EXISTS stacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_description VARCHAR(500) NOT NULL,
  category VARCHAR(100) NOT NULL,
  difficulty VARCHAR(50) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'expert')),
  setup_time_hours INTEGER NOT NULL,
  pricing VARCHAR(50) NOT NULL CHECK (pricing IN ('free', 'freemium', 'paid', 'mixed')),
  author VARCHAR(255) NOT NULL,
  is_official BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create stack_technologies table
CREATE TABLE IF NOT EXISTS stack_technologies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stack_id UUID NOT NULL REFERENCES stacks(id) ON DELETE CASCADE,
  technology_id VARCHAR(100) NOT NULL,
  technology_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('primary', 'secondary', 'optional')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create stack_use_cases table
CREATE TABLE IF NOT EXISTS stack_use_cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stack_id UUID NOT NULL REFERENCES stacks(id) ON DELETE CASCADE,
  use_case TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create stack_pros table
CREATE TABLE IF NOT EXISTS stack_pros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stack_id UUID NOT NULL REFERENCES stacks(id) ON DELETE CASCADE,
  pro TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create stack_cons table
CREATE TABLE IF NOT EXISTS stack_cons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stack_id UUID NOT NULL REFERENCES stacks(id) ON DELETE CASCADE,
  con TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create stack_installation_steps table
CREATE TABLE IF NOT EXISTS stack_installation_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stack_id UUID NOT NULL REFERENCES stacks(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create stack_alternatives table
CREATE TABLE IF NOT EXISTS stack_alternatives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stack_id UUID NOT NULL REFERENCES stacks(id) ON DELETE CASCADE,
  alternative VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create stack_usage_stats table for tracking clicks on "Start Building Now"
CREATE TABLE IF NOT EXISTS stack_usage_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stack_id UUID NOT NULL REFERENCES stacks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  session_id VARCHAR(255),
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX idx_stacks_slug ON stacks(slug);
CREATE INDEX idx_stacks_category ON stacks(category);
CREATE INDEX idx_stacks_difficulty ON stacks(difficulty);
CREATE INDEX idx_stack_technologies_stack_id ON stack_technologies(stack_id);
CREATE INDEX idx_stack_usage_stats_stack_id ON stack_usage_stats(stack_id);

-- Enable Row Level Security
ALTER TABLE stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stack_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE stack_use_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE stack_pros ENABLE ROW LEVEL SECURITY;
ALTER TABLE stack_cons ENABLE ROW LEVEL SECURITY;
ALTER TABLE stack_installation_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE stack_alternatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE stack_usage_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can view stacks" ON stacks FOR SELECT USING (true);
CREATE POLICY "Public can view stack technologies" ON stack_technologies FOR SELECT USING (true);
CREATE POLICY "Public can view stack use cases" ON stack_use_cases FOR SELECT USING (true);
CREATE POLICY "Public can view stack pros" ON stack_pros FOR SELECT USING (true);
CREATE POLICY "Public can view stack cons" ON stack_cons FOR SELECT USING (true);
CREATE POLICY "Public can view stack installation steps" ON stack_installation_steps FOR SELECT USING (true);
CREATE POLICY "Public can view stack alternatives" ON stack_alternatives FOR SELECT USING (true);

-- Create policies for admin write access (only julien.pessione83@gmail.com)
CREATE POLICY "Admin can insert stacks" ON stacks FOR INSERT 
  WITH CHECK (auth.email() = 'julien.pessione83@gmail.com');

CREATE POLICY "Admin can update stacks" ON stacks FOR UPDATE 
  USING (auth.email() = 'julien.pessione83@gmail.com');

CREATE POLICY "Admin can delete stacks" ON stacks FOR DELETE 
  USING (auth.email() = 'julien.pessione83@gmail.com');

-- Similar policies for related tables
CREATE POLICY "Admin can manage stack technologies" ON stack_technologies FOR ALL 
  USING (auth.email() = 'julien.pessione83@gmail.com');

CREATE POLICY "Admin can manage stack use cases" ON stack_use_cases FOR ALL 
  USING (auth.email() = 'julien.pessione83@gmail.com');

CREATE POLICY "Admin can manage stack pros" ON stack_pros FOR ALL 
  USING (auth.email() = 'julien.pessione83@gmail.com');

CREATE POLICY "Admin can manage stack cons" ON stack_cons FOR ALL 
  USING (auth.email() = 'julien.pessione83@gmail.com');

CREATE POLICY "Admin can manage stack installation steps" ON stack_installation_steps FOR ALL 
  USING (auth.email() = 'julien.pessione83@gmail.com');

CREATE POLICY "Admin can manage stack alternatives" ON stack_alternatives FOR ALL 
  USING (auth.email() = 'julien.pessione83@gmail.com');

-- Allow anyone to insert usage stats
CREATE POLICY "Anyone can track usage" ON stack_usage_stats FOR INSERT 
  WITH CHECK (true);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_stacks_updated_at BEFORE UPDATE ON stacks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();