import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

export interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
  website?: string;
  github?: string;
  twitter?: string;
  avatar?: string;
  joinedDate: string;
  isAuthenticated: boolean;
}

export interface UserStats {
  stacksCreated: number;
  totalStars: number;
  contributions: number;
  followersCount: number;
  followingCount: number;
}

interface UserState {
  user: User | null;
  stats: UserStats;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User) => void;
  updateProfile: (updates: Partial<User>) => void;
  updateStats: (stats: Partial<UserStats>) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'joinedDate' | 'isAuthenticated'>) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        user: null,
        stats: {
          stacksCreated: 0,
          totalStars: 0,
          contributions: 0,
          followersCount: 0,
          followingCount: 0,
        },
        isLoading: false,
        error: null,
        
        setUser: (user) =>
          set({ user }, false, 'setUser'),
          
        updateProfile: (updates) =>
          set((state) => ({
            user: state.user ? { ...state.user, ...updates } : null,
          }), false, 'updateProfile'),
          
        updateStats: (stats) =>
          set((state) => ({
            stats: { ...state.stats, ...stats },
          }), false, 'updateStats'),
          
        login: async (email, password) => {
          set({ isLoading: true, error: null }, false, 'login:start');
          
          try {
            const supabase = createClient();
            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            
            if (error) throw error;
            
            if (data.user) {
              // Fetch user profile from the users table
              const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', data.user.id)
                .single();
              
              const user: User = {
                id: data.user.id,
                name: profile?.name || data.user.user_metadata?.name || 'Anonymous',
                email: data.user.email || '',
                bio: profile?.bio || '',
                website: profile?.website || '',
                github: profile?.github || '',
                twitter: profile?.twitter || '',
                avatar: profile?.avatar_url || '',
                joinedDate: data.user.created_at,
                isAuthenticated: true,
              };
              
              // Mock stats for now - in real app, calculate from user's stacks
              const mockStats: UserStats = {
                stacksCreated: 0,
                totalStars: 0,
                contributions: 0,
                followersCount: 0,
                followingCount: 0,
              };
              
              set({
                user,
                stats: mockStats,
                isLoading: false,
                error: null,
              }, false, 'login:success');
            }
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Login failed',
            }, false, 'login:error');
          }
        },
        
        logout: async () => {
          const supabase = createClient();
          await supabase.auth.signOut();
          
          set({
            user: null,
            stats: {
              stacksCreated: 0,
              totalStars: 0,
              contributions: 0,
              followersCount: 0,
              followingCount: 0,
            },
            error: null,
          }, false, 'logout');
        },
          
        register: async (userData) => {
          set({ isLoading: true, error: null }, false, 'register:start');
          
          try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const newUser: User = {
              ...userData,
              id: Date.now().toString(),
              joinedDate: new Date().toISOString(),
              isAuthenticated: true,
            };
            
            set({
              user: newUser,
              isLoading: false,
              error: null,
            }, false, 'register:success');
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Registration failed',
            }, false, 'register:error');
          }
        },
        
        setLoading: (loading) =>
          set({ isLoading: loading }, false, 'setLoading'),
          
        setError: (error) =>
          set({ error }, false, 'setError'),
      }),
      {
        name: 'user-store',
        partialize: (state) => ({
          user: state.user,
          stats: state.stats,
        }),
      }
    ),
    { name: 'user-store' }
  )
);