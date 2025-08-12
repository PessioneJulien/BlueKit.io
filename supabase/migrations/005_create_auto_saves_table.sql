-- Migration: Add auto_saves table for enhanced auto-save functionality
-- Date: 2024-12-30
-- Description: Creates table for storing auto-save data with user context

-- Create auto_saves table
CREATE TABLE IF NOT EXISTS public.auto_saves (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  save_key VARCHAR(255) NOT NULL,
  save_data JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Composite unique constraint to allow one save per user per key
  UNIQUE(user_id, save_key)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_auto_saves_user_id ON public.auto_saves(user_id);
CREATE INDEX IF NOT EXISTS idx_auto_saves_user_key ON public.auto_saves(user_id, save_key);
CREATE INDEX IF NOT EXISTS idx_auto_saves_created_at ON public.auto_saves(created_at);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_auto_saves_updated_at 
    BEFORE UPDATE ON public.auto_saves 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.auto_saves ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own auto-saves
CREATE POLICY "Users can manage their own auto-saves" ON public.auto_saves
  FOR ALL USING (auth.uid() = user_id);

-- Policy: Users can insert their own auto-saves
CREATE POLICY "Users can insert their own auto-saves" ON public.auto_saves
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own auto-saves
CREATE POLICY "Users can update their own auto-saves" ON public.auto_saves
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own auto-saves
CREATE POLICY "Users can delete their own auto-saves" ON public.auto_saves
  FOR DELETE USING (auth.uid() = user_id);

-- Add cleanup function for old auto-saves (optional)
CREATE OR REPLACE FUNCTION cleanup_old_auto_saves()
RETURNS void AS $$
BEGIN
  -- Delete auto-saves older than 30 days
  DELETE FROM public.auto_saves 
  WHERE created_at < now() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE public.auto_saves IS 'Stores auto-save data for stack builder with user context';
COMMENT ON COLUMN public.auto_saves.save_key IS 'Unique key identifying the type of save (e.g., visual_stack_builder)';
COMMENT ON COLUMN public.auto_saves.save_data IS 'JSONB data containing the saved state';
COMMENT ON COLUMN public.auto_saves.version IS 'Version number for conflict resolution';
COMMENT ON FUNCTION cleanup_old_auto_saves() IS 'Cleanup function to remove old auto-saves (run via cron job)';