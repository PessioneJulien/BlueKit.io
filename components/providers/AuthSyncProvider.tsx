'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUserStore } from '@/lib/stores/userStore';
import { createClient } from '@/lib/supabase/client';

interface AuthSyncProviderProps {
  children: React.ReactNode;
}

export const AuthSyncProvider: React.FC<AuthSyncProviderProps> = ({ children }) => {
  const { user: authUser, loading } = useAuth();
  const { user: storeUser, setUser, logout } = useUserStore();

  useEffect(() => {
    const syncAuthState = async () => {
      if (loading) return; // Wait for auth to load

      if (authUser && !storeUser) {
        // User is authenticated but store doesn't have user data
        console.log('🔄 Syncing authenticated user to store:', authUser.email);
        
        try {
          const supabase = createClient();
          
          // Fetch user profile from the users table
          const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (error) {
            console.warn('Failed to fetch user profile:', error.message);
            // Create user object with auth data only
            const user = {
              id: authUser.id,
              name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Anonymous',
              email: authUser.email || '',
              bio: '',
              website: '',
              github: '',
              twitter: '',
              avatar: authUser.user_metadata?.avatar_url || '',
              joinedDate: authUser.created_at,
              isAuthenticated: true,
            };
            
            setUser(user);
          } else {
            // Create user object with profile data
            const user = {
              id: authUser.id,
              name: profile?.name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Anonymous',
              email: authUser.email || '',
              bio: profile?.bio || '',
              website: profile?.website || '',
              github: profile?.github || '',
              twitter: profile?.twitter || '',
              avatar: profile?.avatar_url || authUser.user_metadata?.avatar_url || '',
              joinedDate: authUser.created_at,
              isAuthenticated: true,
            };
            
            setUser(user);
          }
        } catch (error) {
          console.error('Error syncing user data:', error);
        }
      } else if (!authUser && storeUser) {
        // User is not authenticated but store has user data - clear it
        console.log('🔄 Clearing user from store (not authenticated)');
        await logout();
      }
    };

    syncAuthState();
  }, [authUser, storeUser, loading, setUser, logout]);

  return <>{children}</>;
};