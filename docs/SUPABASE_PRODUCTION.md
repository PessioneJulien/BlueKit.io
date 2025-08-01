# 🚀 Supabase Production Deployment Guide

Comprehensive guide for deploying the BlueKit.io Stack Builder Platform to production using Supabase.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Project Setup](#supabase-project-setup)
3. [Database Schema](#database-schema)
4. [Row Level Security (RLS)](#row-level-security-rls)
5. [Environment Configuration](#environment-configuration)
6. [Authentication Setup](#authentication-setup)
7. [Storage Configuration](#storage-configuration)
8. [Edge Functions](#edge-functions)
9. [Performance Optimization](#performance-optimization)
10. [Monitoring & Logging](#monitoring--logging)
11. [Backup & Recovery](#backup--recovery)
12. [Security Best Practices](#security-best-practices)
13. [Deployment Checklist](#deployment-checklist)

## Prerequisites

- Supabase account with Pro plan (recommended for production)
- Domain name with SSL certificate
- Node.js 18+ and npm/yarn
- Git repository access
- Basic understanding of PostgreSQL and SQL

## Supabase Project Setup

### 1. Create Production Project

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Create new project (via Supabase Dashboard)
# - Project Name: bluekit-production
# - Organization: Your organization
# - Database Password: Generate strong password (save securely)
# - Region: Choose closest to your users
```

### 2. Project Configuration

```bash
# Link your local project to Supabase
supabase link --project-ref YOUR_PROJECT_REF

# Initialize if needed
supabase init
```

## Database Schema

### 1. Core Tables

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users profile table (extends auth.users)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    company VARCHAR(255),
    role VARCHAR(100),
    bio TEXT,
    website_url TEXT,
    github_username VARCHAR(100),
    linkedin_url TEXT,
    preferences JSONB DEFAULT '{}',
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Technology stacks table
CREATE TABLE public.technology_stacks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    nodes JSONB NOT NULL DEFAULT '[]',
    connections JSONB NOT NULL DEFAULT '[]',
    is_public BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    category VARCHAR(100),
    difficulty_level VARCHAR(50) DEFAULT 'intermediate',
    estimated_setup_time INTEGER DEFAULT 0, -- in hours
    star_count INTEGER DEFAULT 0,
    fork_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Stack templates (official/community)
CREATE TABLE public.stack_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    template_data JSONB NOT NULL,
    category VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'intermediate',
    tags TEXT[] DEFAULT '{}',
    is_official BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    rating_average DECIMAL(3,2) DEFAULT 0.00,
    rating_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- User stack interactions (stars, forks, etc.)
CREATE TABLE public.stack_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    stack_id UUID REFERENCES technology_stacks(id) ON DELETE CASCADE NOT NULL,
    interaction_type VARCHAR(50) NOT NULL, -- 'star', 'fork', 'view', 'share'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, stack_id, interaction_type)
);

-- Stack reviews and ratings
CREATE TABLE public.stack_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    stack_id UUID REFERENCES technology_stacks(id) ON DELETE CASCADE NOT NULL,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    title VARCHAR(255),
    content TEXT,
    pros TEXT[],
    cons TEXT[],
    use_case TEXT,
    experience_level VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(stack_id, reviewer_id)
);

-- Custom categories (user-defined)
CREATE TABLE public.custom_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6366F1', -- hex color
    icon VARCHAR(10) DEFAULT '📦', -- emoji
    is_public BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Analytics and usage tracking
CREATE TABLE public.analytics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB DEFAULT '{}',
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Feedback and feature requests
CREATE TABLE public.user_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    feedback_type VARCHAR(50) NOT NULL, -- 'bug', 'feature', 'improvement', 'other'
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    browser_info JSONB,
    contact_email VARCHAR(255),
    is_public BOOLEAN DEFAULT FALSE,
    upvote_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

### 2. Indexes for Performance

```sql
-- Performance indexes
CREATE INDEX idx_technology_stacks_author_id ON technology_stacks(author_id);
CREATE INDEX idx_technology_stacks_public ON technology_stacks(is_public);
CREATE INDEX idx_technology_stacks_featured ON technology_stacks(is_featured);
CREATE INDEX idx_technology_stacks_category ON technology_stacks(category);
CREATE INDEX idx_technology_stacks_created_at ON technology_stacks(created_at DESC);
CREATE INDEX idx_technology_stacks_star_count ON technology_stacks(star_count DESC);

CREATE INDEX idx_stack_interactions_user_id ON stack_interactions(user_id);
CREATE INDEX idx_stack_interactions_stack_id ON stack_interactions(stack_id);
CREATE INDEX idx_stack_interactions_type ON stack_interactions(interaction_type);

CREATE INDEX idx_stack_reviews_stack_id ON stack_reviews(stack_id);
CREATE INDEX idx_stack_reviews_rating ON stack_reviews(rating);

CREATE INDEX idx_custom_categories_user_id ON custom_categories(user_id);
CREATE INDEX idx_custom_categories_public ON custom_categories(is_public);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);

-- Full-text search indexes
CREATE INDEX idx_technology_stacks_search ON technology_stacks 
USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));

CREATE INDEX idx_stack_templates_search ON stack_templates 
USING GIN (to_tsvector('english', name || ' ' || COALESCE(description, '')));
```

### 3. Database Functions

```sql
-- Function to update star count
CREATE OR REPLACE FUNCTION update_stack_star_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.interaction_type = 'star' THEN
        UPDATE technology_stacks 
        SET star_count = star_count + 1,
            updated_at = NOW()
        WHERE id = NEW.stack_id;
    ELSIF TG_OP = 'DELETE' AND OLD.interaction_type = 'star' THEN
        UPDATE technology_stacks 
        SET star_count = GREATEST(star_count - 1, 0),
            updated_at = NOW()
        WHERE id = OLD.stack_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for star count updates
CREATE TRIGGER trigger_update_star_count
    AFTER INSERT OR DELETE ON stack_interactions
    FOR EACH ROW
    EXECUTE FUNCTION update_stack_star_count();

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_technology_stacks_updated_at 
    BEFORE UPDATE ON technology_stacks
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stack_templates_updated_at 
    BEFORE UPDATE ON stack_templates
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stack_reviews_updated_at 
    BEFORE UPDATE ON stack_reviews
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_categories_updated_at 
    BEFORE UPDATE ON custom_categories
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_feedback_updated_at 
    BEFORE UPDATE ON user_feedback
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

## Row Level Security (RLS)

### 1. Enable RLS

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE technology_stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE stack_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE stack_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stack_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
```

### 2. User Profiles Policies

```sql
-- User profiles: users can view public profiles and modify their own
CREATE POLICY "Public profiles are viewable by everyone" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON user_profiles
    FOR DELETE USING (auth.uid() = id);
```

### 3. Technology Stacks Policies

```sql
-- Technology stacks: public stacks viewable by all, private by owner only
CREATE POLICY "Public stacks are viewable by everyone" ON technology_stacks
    FOR SELECT USING (is_public = true OR auth.uid() = author_id);

CREATE POLICY "Authenticated users can create stacks" ON technology_stacks
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = author_id);

CREATE POLICY "Users can update own stacks" ON technology_stacks
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own stacks" ON technology_stacks
    FOR DELETE USING (auth.uid() = author_id);
```

### 4. Stack Interactions Policies

```sql
-- Stack interactions: users can manage their own interactions
CREATE POLICY "Users can view own interactions" ON stack_interactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own interactions" ON stack_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own interactions" ON stack_interactions
    FOR DELETE USING (auth.uid() = user_id);
```

### 5. Stack Reviews Policies

```sql
-- Stack reviews: public reviews viewable by all
CREATE POLICY "Stack reviews are viewable by everyone" ON stack_reviews
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON stack_reviews
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = reviewer_id);

CREATE POLICY "Users can update own reviews" ON stack_reviews
    FOR UPDATE USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete own reviews" ON stack_reviews
    FOR DELETE USING (auth.uid() = reviewer_id);
```

### 6. Custom Categories Policies

```sql
-- Custom categories: public categories viewable by all, private by owner
CREATE POLICY "Public categories are viewable by everyone" ON custom_categories
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create own categories" ON custom_categories
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON custom_categories
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON custom_categories
    FOR DELETE USING (auth.uid() = user_id);
```

### 7. Analytics and Feedback Policies

```sql
-- Analytics: users can create events, admins can read all
CREATE POLICY "Users can create analytics events" ON analytics_events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Admin-only read access to analytics (implement role-based access)
CREATE POLICY "Admins can view analytics" ON analytics_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- User feedback: users can create and view their own feedback
CREATE POLICY "Users can create feedback" ON user_feedback
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view own feedback" ON user_feedback
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can update own feedback" ON user_feedback
    FOR UPDATE USING (auth.uid() = user_id);
```

## Environment Configuration

### 1. Environment Variables

Create `.env.local` for production:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database
DATABASE_URL=postgresql://postgres:[password]@db.your-project-ref.supabase.co:5432/postgres

# NextJS Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret

# API Keys
OPENAI_API_KEY=your-openai-key (if using AI features)

# Email Configuration (for notifications)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=your-resend-api-key
FROM_EMAIL=noreply@your-domain.com

# Analytics (optional)
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
POSTHOG_KEY=your-posthog-key

# Security
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=3600000

# Storage
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=stack-assets
```

### 2. Supabase Configuration

Update `lib/supabase/client.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})
```

## Authentication Setup

### 1. OAuth Providers

Configure in Supabase Dashboard > Authentication > Providers:

```yaml
# GitHub OAuth
Client ID: your-github-client-id
Client Secret: your-github-secret
Redirect URL: https://your-project-ref.supabase.co/auth/v1/callback

# Google OAuth
Client ID: your-google-client-id
Client Secret: your-google-secret
Redirect URL: https://your-project-ref.supabase.co/auth/v1/callback

# Additional providers as needed
```

### 2. Authentication Hooks

Create user profile automatically on signup:

```sql
-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

### 3. Session Management

```typescript
// lib/auth/session.ts
import { supabase } from '@/lib/supabase/client'

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const refreshSession = async () => {
  const { data: { session }, error } = await supabase.auth.refreshSession()
  if (error) throw error
  return session
}
```

## Storage Configuration

### 1. Storage Buckets

Create buckets in Supabase Dashboard > Storage:

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('stack-assets', 'stack-assets', true),
('user-avatars', 'user-avatars', true),
('exports', 'exports', false);
```

### 2. Storage Policies

```sql
-- Stack assets bucket policies
CREATE POLICY "Public stack assets are viewable by everyone" ON storage.objects
    FOR SELECT USING (bucket_id = 'stack-assets');

CREATE POLICY "Authenticated users can upload stack assets" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'stack-assets' AND 
        auth.role() = 'authenticated'
    );

-- User avatars bucket policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'user-avatars' AND 
        auth.role() = 'authenticated' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'user-avatars' AND 
        auth.role() = 'authenticated' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );

-- Exports bucket (private)
CREATE POLICY "Users can access their own exports" ON storage.objects
    FOR ALL USING (
        bucket_id = 'exports' AND 
        auth.role() = 'authenticated' AND
        (storage.foldername(name))[1] = auth.uid()::text
    );
```

## Edge Functions

### 1. Setup Edge Functions

```bash
# Create edge functions directory
mkdir -p supabase/functions

# Create analytics function
mkdir supabase/functions/analytics
```

### 2. Analytics Edge Function

```typescript
// supabase/functions/analytics/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { event_type, event_data, user_id } = await req.json()

    const { data, error } = await supabaseClient
      .from('analytics_events')
      .insert({
        event_type,
        event_data,
        user_id,
        session_id: req.headers.get('x-session-id'),
        ip_address: req.headers.get('x-forwarded-for')?.split(',')[0],
        user_agent: req.headers.get('user-agent')
      })

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
```

### 3. Deploy Edge Functions

```bash
# Deploy analytics function
supabase functions deploy analytics --project-ref YOUR_PROJECT_REF

# Set environment variables
supabase secrets set OPENAI_API_KEY=your-key --project-ref YOUR_PROJECT_REF
```

## Performance Optimization

### 1. Database Optimization

```sql
-- Enable pg_stat_statements for query analysis
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Optimize expensive queries with materialized views
CREATE MATERIALIZED VIEW popular_stacks AS
SELECT 
    ts.*,
    up.full_name as author_name,
    up.avatar_url as author_avatar
FROM technology_stacks ts
JOIN user_profiles up ON ts.author_id = up.id
WHERE ts.is_public = true
ORDER BY ts.star_count DESC, ts.view_count DESC
LIMIT 100;

-- Refresh materialized view periodically
CREATE OR REPLACE FUNCTION refresh_popular_stacks()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW popular_stacks;
END;
$$ LANGUAGE plpgsql;

-- Schedule refresh (use pg_cron if available)
SELECT cron.schedule('refresh-popular-stacks', '0 */6 * * *', 'SELECT refresh_popular_stacks();');
```

### 2. Connection Pooling

Configure in Supabase Dashboard > Settings > Database:

```yaml
Pool Size: 15
Connection Limit: 60
Statement Timeout: 30s
Idle Timeout: 10m
```

### 3. CDN Configuration

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-project-ref.supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    scrollRestoration: true,
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
}

module.exports = nextConfig
```

## Monitoring & Logging

### 1. Error Tracking

```typescript
// lib/monitoring/sentry.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Filter out sensitive data
    if (event.extra) {
      delete event.extra.password;
      delete event.extra.token;
    }
    return event;
  },
});
```

### 2. Performance Monitoring

```typescript
// lib/monitoring/performance.ts
export const trackPerformance = (name: string, fn: () => Promise<any>) => {
  return async (...args: any[]) => {
    const startTime = performance.now();
    try {
      const result = await fn(...args);
      const duration = performance.now() - startTime;
      
      // Send to analytics
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'performance',
          event_data: { operation: name, duration }
        })
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      // Track errors with performance data
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'error',
          event_data: { 
            operation: name, 
            duration, 
            error: error.message 
          }
        })
      });
      
      throw error;
    }
  };
};
```

### 3. Health Checks

```typescript
// pages/api/health.ts
import { supabase } from '@/lib/supabase/server'

export default async function handler(req, res) {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);

    if (error) throw error;

    // Test edge functions
    const functionsHealth = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/analytics`,
      { 
        method: 'OPTIONS',
        headers: { 'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY }
      }
    );

    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        edge_functions: functionsHealth.ok ? 'up' : 'down'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
```

## Backup & Recovery

### 1. Automated Backups

Supabase Pro includes automated backups. Configure additional backup strategies:

```bash
# Manual backup script
#!/bin/bash
pg_dump "postgresql://postgres:[password]@db.your-project-ref.supabase.co:5432/postgres" \
  --no-owner --no-acl --clean --if-exists \
  --exclude-table-data=analytics_events \
  > backup_$(date +%Y%m%d_%H%M%S).sql

# Upload to external storage (AWS S3, Google Cloud, etc.)
aws s3 cp backup_*.sql s3://your-backup-bucket/supabase/
```

### 2. Point-in-Time Recovery

```sql
-- Create restore point
SELECT pg_create_restore_point('pre_major_update');

-- Recovery procedures documented in runbook
```

## Security Best Practices

### 1. API Rate Limiting

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimitMap = new Map()

export function middleware(request: NextRequest) {
  const ip = request.ip || 'anonymous'
  const limit = 100 // requests per hour
  const windowMs = 60 * 60 * 1000 // 1 hour

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, {
      count: 0,
      lastReset: Date.now(),
    })
  }

  const ipData = rateLimitMap.get(ip)
  
  if (Date.now() - ipData.lastReset > windowMs) {
    ipData.count = 0
    ipData.lastReset = Date.now()
  }

  if (ipData.count >= limit) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }

  ipData.count += 1
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}
```

### 2. Input Validation

```typescript
// lib/validation/schemas.ts
import { z } from 'zod'

export const stackSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  nodes: z.array(z.object({
    id: z.string(),
    name: z.string(),
    category: z.string(),
    // ... other node fields
  })),
  connections: z.array(z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
  })),
  is_public: z.boolean().default(true),
})

export const validateStack = (data: unknown) => {
  return stackSchema.parse(data)
}
```

### 3. Content Security Policy

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' *.supabase.co",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: *.supabase.co",
      "font-src 'self'",
      "connect-src 'self' *.supabase.co wss://*.supabase.co",
    ].join('; '),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}
```

## Deployment Checklist

### Pre-Deployment

- [ ] Database schema deployed and tested
- [ ] RLS policies configured and tested
- [ ] Environment variables configured
- [ ] SSL certificates configured
- [ ] Domain DNS configured
- [ ] Authentication providers configured
- [ ] Storage buckets and policies configured
- [ ] Edge functions deployed
- [ ] Monitoring and alerting configured

### Testing

- [ ] Database connections tested
- [ ] Authentication flows tested
- [ ] API endpoints tested
- [ ] File uploads tested
- [ ] Performance testing completed
- [ ] Security testing completed
- [ ] Load testing completed

### Go-Live

- [ ] Database backup created
- [ ] Monitoring dashboards configured  
- [ ] Error tracking configured
- [ ] Health checks configured
- [ ] Documentation updated
- [ ] Team notified
- [ ] Rollback plan prepared

### Post-Deployment

- [ ] Monitor application performance
- [ ] Check error rates and logs
- [ ] Verify all features working
- [ ] Monitor database performance
- [ ] Check security alerts
- [ ] Schedule regular maintenance

## Support and Maintenance

### Regular Tasks

1. **Weekly**
   - Review error logs and performance metrics
   - Check database query performance
   - Verify backup integrity
   - Update dependencies

2. **Monthly**
   - Analyze usage patterns and optimize
   - Review and rotate API keys
   - Update security policies
   - Performance optimization

3. **Quarterly**
   - Security audit
   - Disaster recovery testing
   - Capacity planning review
   - Cost optimization

### Troubleshooting

#### Common Issues

1. **Connection Pool Exhaustion**
   - Increase pool size in Supabase settings
   - Optimize long-running queries
   - Implement connection pooling in application

2. **RLS Policy Issues** 
   - Test policies with different user roles
   - Check policy conditions carefully
   - Use SQL EXPLAIN to debug performance

3. **Storage Access Issues**
   - Verify bucket policies
   - Check file permissions
   - Validate upload file types and sizes

#### Emergency Contacts

- Supabase Support: support@supabase.io
- Emergency Escalation: [Your team contact info]
- Database Admin: [DBA contact info]

---

🎉 **Congratulations!** Your BlueKit.io Stack Builder Platform is now ready for production with Supabase!

For additional support, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [PostgreSQL Performance Guide](https://wiki.postgresql.org/wiki/Performance_Optimization)