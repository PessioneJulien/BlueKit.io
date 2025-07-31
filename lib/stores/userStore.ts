import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
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

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  bio?: string;
  website?: string;
  github?: string;
  twitter?: string;
}

interface UserState {
  // Hydration state
  _hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  
  user: User | null;
  stats: UserStats;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User) => void;
  updateProfile: (updates: Partial<User>) => void;
  updateStats: (stats: Partial<UserStats>) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        _hasHydrated: false,
        setHasHydrated: (hasHydrated: boolean) => {
          set({ _hasHydrated: hasHydrated }, false, 'setHasHydrated');
        },
        
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
              const { data: profile } = await supabase
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
            const supabase = createClient();
            
            // Register with Supabase Auth
            const { data, error } = await supabase.auth.signUp({
              email: userData.email,
              password: userData.password,
              options: {
                data: {
                  name: userData.name,
                  bio: userData.bio,
                  website: userData.website,
                  github: userData.github,
                  twitter: userData.twitter,
                }
              }
            });
            
            if (error) throw error;
            
            if (data.user) {
              console.log('User created in auth.users, waiting for trigger to create profile...');
              
              // The trigger should automatically create the user profile
              // Let's wait a bit more and retry a few times
              let profile = null;
              let retries = 0;
              const maxRetries = 5;
              
              while (retries < maxRetries && !profile) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const { data: fetchedProfile, error: profileError } = await supabase
                  .from('users')
                  .select('*')
                  .eq('id', data.user.id)
                  .single();
                
                if (!profileError && fetchedProfile) {
                  profile = fetchedProfile;
                  console.log('Profile found:', profile);
                  break;
                }
                
                retries++;
                console.log(`Profile not found yet, retry ${retries}/${maxRetries}...`);
                
                // On the last retry, try to create the profile manually
                if (retries === maxRetries) {
                  console.log('Trigger failed, attempting manual profile creation...');
                  const { data: createdProfile, error: createError } = await supabase
                    .from('users')
                    .insert({
                      id: data.user.id,
                      name: userData.name,
                      email: userData.email,
                      bio: userData.bio || '',
                      website: userData.website || '',
                      github: userData.github || '',
                      twitter: userData.twitter || '',
                      avatar_url: '',
                    })
                    .select()
                    .single();
                  
                  if (!createError && createdProfile) {
                    profile = createdProfile;
                    console.log('Profile created manually:', profile);
                  } else {
                    console.error('Manual profile creation failed:', createError);
                  }
                }
              }
              
              // Create user object with available data
              const newUser: User = {
                id: data.user.id,
                name: profile?.name || userData.name,
                email: profile?.email || userData.email,
                bio: profile?.bio || userData.bio || '',
                website: profile?.website || userData.website || '',
                github: profile?.github || userData.github || '',
                twitter: profile?.twitter || userData.twitter || '',
                avatar: profile?.avatar_url || '',
                joinedDate: data.user.created_at,
                isAuthenticated: true,
              };
              
              console.log('Registration successful, user object:', newUser);
              
              set({
                user: newUser,
                isLoading: false,
                error: null,
              }, false, 'register:success');
            }
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
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
      }
    ),
    { name: 'user-store' }
  )
);