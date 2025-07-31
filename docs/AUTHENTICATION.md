# Authentication with Supabase

This document explains how authentication is implemented in the BlueKit Stack Builder platform using Supabase.

## Overview

The authentication system uses Supabase Auth with the following features:
- Email/password authentication
- OAuth providers (GitHub, Google)
- Password reset functionality
- Protected routes middleware
- User profile management
- Row Level Security (RLS)

## Architecture

### Client-Side Authentication

```typescript
// lib/hooks/useAuth.ts
export function useAuth() {
  const { user, loading, signIn, signUp, signOut, ... } = useAuth()
}
```

### Server-Side Authentication

```typescript
// lib/supabase/server.ts - Server components
import { createClient } from '@/lib/supabase/server'

// lib/supabase/client.ts - Client components  
import { createClient } from '@/lib/supabase/client'
```

### Middleware Protection

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
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
```

### Related Tables
- `stacks` - User-created technology stacks
- `reviews` - Stack reviews and ratings  
- `stack_technologies` - Technologies in each stack

## Authentication Flow

### 1. Sign Up Process
1. User fills registration form (`/auth/signup`)
2. Supabase creates auth user
3. Trigger automatically creates profile in `users` table
4. Email confirmation sent (if enabled)
5. User can sign in after confirmation

### 2. Sign In Process
1. User enters credentials (`/auth/login`)
2. Supabase validates and creates session
3. User profile fetched from `users` table
4. User redirected to protected area

### 3. OAuth Flow
1. User clicks OAuth provider button
2. Redirected to provider authentication
3. Provider redirects to `/auth/callback`
4. Supabase exchanges code for session
5. User profile created/updated automatically

## Protected Routes

Routes are protected by middleware that checks authentication status:

### Public Routes
- `/` - Homepage
- `/stacks` - Browse stacks (public stacks only)
- `/stacks/[id]` - Stack details (public stacks only)
- `/auth/*` - Authentication pages

### Protected Routes
- `/profile` - User dashboard
- `/builder` - Stack builder
- `/settings` - User settings
- Private stacks and user-specific features

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Row Level Security (RLS)

### Users Table Policies
```sql
-- Users can view public profiles
CREATE POLICY "Users can view public profiles" ON public.users
  FOR SELECT USING (true);

-- Users can only update their own profile  
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);
```

### Stacks Table Policies
```sql
-- Anyone can view public stacks
CREATE POLICY "Anyone can view public stacks" ON public.stacks
  FOR SELECT USING (is_public = true);

-- Users can view their own private stacks
CREATE POLICY "Users can view own stacks" ON public.stacks
  FOR SELECT USING (auth.uid() = author_id);

-- Users can create, update, delete their own stacks
CREATE POLICY "Users can manage own stacks" ON public.stacks
  FOR ALL USING (auth.uid() = author_id);
```

## Usage Examples

### Protecting a Page
```typescript
'use client'
import { useAuth } from '@/lib/hooks/useAuth'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProtectedPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) return <div>Loading...</div>
  if (!user) return null

  return <div>Protected content</div>
}
```

### Server-Side User Check
```typescript
import { createClient } from '@/lib/supabase/server'

export default async function ServerPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please sign in</div>
  }

  return <div>Hello {user.email}</div>
}
```

### Accessing User Profile
```typescript
const supabase = createClient()

// Get user profile
const { data: profile } = await supabase
  .from('users')
  .select('*')
  .eq('id', user.id)
  .single()

// Update user profile  
const { error } = await supabase
  .from('users')
  .update({ name: 'New Name' })
  .eq('id', user.id)
```

## Setup Instructions

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note down project URL and anon key

### 2. Run Database Migrations
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase locally
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 3. Configure Authentication
1. Go to Authentication > Settings in Supabase dashboard
2. Enable email confirmation (recommended)
3. Configure OAuth providers (GitHub, Google)
4. Set redirect URLs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

### 4. Update Environment Variables
Copy values from Supabase dashboard to `.env.local`

## Security Considerations

### 1. Row Level Security
- All user data is protected by RLS policies
- Users can only access their own private data
- Public data is available to all authenticated users

### 2. API Security
- Anon key is safe for client-side use
- Service role key should only be used server-side
- All database operations go through Supabase Auth

### 3. Route Protection
- Middleware handles authentication checks
- Protected routes redirect to login
- Session refresh handled automatically

## Troubleshooting

### Common Issues

1. **"Invalid login credentials"**
   - Check email/password are correct
   - Ensure user has confirmed email (if enabled)
   - Check Supabase dashboard for user status

2. **"Failed to fetch user"**
   - Check environment variables are correct
   - Verify Supabase project is active
   - Check network connectivity

3. **"Permission denied"**
   - Review RLS policies
   - Check user authentication status
   - Verify correct user ID is being used

4. **OAuth not working**
   - Check redirect URLs are configured
   - Verify OAuth provider credentials
   - Ensure HTTPS in production

### Debug Tips

```typescript
// Check current user
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user)

// Check session
const { data: { session } } = await supabase.auth.getSession()
console.log('Current session:', session)

// Test database connection
const { data, error } = await supabase.from('users').select('count')
console.log('DB test:', { data, error })
```

## Next Steps

- [ ] Set up email templates in Supabase
- [ ] Configure custom OAuth providers
- [ ] Implement user avatar uploads
- [ ] Add two-factor authentication
- [ ] Set up audit logging