-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  bio TEXT,
  website TEXT,
  github TEXT,
  twitter TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create technologies table
CREATE TABLE public.technologies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('frontend', 'backend', 'database', 'devops', 'mobile', 'ai', 'other')),
  description TEXT,
  logo_url TEXT,
  documentation_url TEXT,
  setup_time_hours INTEGER,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'expert')),
  pricing TEXT CHECK (pricing IN ('free', 'freemium', 'paid', 'mixed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create stacks table
CREATE TABLE public.stacks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  use_cases TEXT[],
  author_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  is_official BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create stack_technologies junction table
CREATE TABLE public.stack_technologies (
  stack_id UUID REFERENCES public.stacks(id) ON DELETE CASCADE,
  technology_id UUID REFERENCES public.technologies(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('primary', 'secondary', 'optional')),
  order_index INTEGER,
  PRIMARY KEY (stack_id, technology_id)
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  stack_id UUID REFERENCES public.stacks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  criteria JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stack_id, user_id)
);

-- Create stack_stats view for aggregated statistics
CREATE VIEW public.stack_stats AS
SELECT 
  s.id,
  s.name,
  s.description,
  s.use_cases,
  s.author_id,
  s.is_official,
  s.is_public,
  s.created_at,
  s.updated_at,
  COALESCE(r.avg_rating, 0) as avg_rating,
  COALESCE(r.review_count, 0) as review_count,
  COALESCE(st.tech_count, 0) as tech_count
FROM public.stacks s
LEFT JOIN (
  SELECT 
    stack_id,
    AVG(rating)::DECIMAL(3,2) as avg_rating,
    COUNT(*)::INTEGER as review_count
  FROM public.reviews
  GROUP BY stack_id
) r ON s.id = r.stack_id
LEFT JOIN (
  SELECT 
    stack_id,
    COUNT(*)::INTEGER as tech_count
  FROM public.stack_technologies
  GROUP BY stack_id
) st ON s.id = st.stack_id;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_stacks_updated_at BEFORE UPDATE ON public.stacks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Users can read all public user profiles
CREATE POLICY "Users can view public profiles" ON public.users
  FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Anyone can read public stacks
CREATE POLICY "Anyone can view public stacks" ON public.stacks
  FOR SELECT USING (is_public = true);

-- Users can read their own private stacks
CREATE POLICY "Users can view own stacks" ON public.stacks
  FOR SELECT USING (auth.uid() = author_id);

-- Users can create stacks
CREATE POLICY "Users can create stacks" ON public.stacks
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Users can update their own stacks
CREATE POLICY "Users can update own stacks" ON public.stacks
  FOR UPDATE USING (auth.uid() = author_id);

-- Users can delete their own stacks
CREATE POLICY "Users can delete own stacks" ON public.stacks
  FOR DELETE USING (auth.uid() = author_id);

-- Anyone can read reviews for public stacks
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

-- Users can create reviews
CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;