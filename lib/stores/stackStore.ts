import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Technology } from '@/components/ui/TechnologyCard';
import { createClient } from '@/lib/supabase/client';
import { NodeData, NodePosition } from '@/components/ui/VisualBuilder/CanvasNode';
import { Connection } from '@/components/ui/VisualBuilder/ConnectionLine';


export interface CanvasNode extends NodeData {
  position: NodePosition;
  isCompact?: boolean;
  width?: number;
  height?: number;
  documentation?: string;
}

export interface Stack {
  id: string;
  name: string;
  description: string;
  nodes: CanvasNode[];
  connections: Connection[];
  author_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  // Legacy support
  technologies?: Technology[];
  author?: string;
  stars?: number;
  uses?: number;
  difficulty?: 'beginner' | 'intermediate' | 'expert';
  category?: string;
  createdAt?: string;
  isPublic?: boolean;
}

interface StackState {
  // Hydration state
  _hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;
  
  // Current builder state
  currentStack: {
    name: string;
    description: string;
    nodes: CanvasNode[];
    connections: Connection[];
  };
  
  // User's saved stacks
  userStacks: Stack[];
  
  // Favorite stacks
  favoriteStacks: string[];
  
  // Builder actions
  setStackName: (name: string) => void;
  setStackDescription: (description: string) => void;
  addTechnology: (technology: Technology) => void;
  removeTechnology: (technologyId: string) => void;
  reorderTechnologies: (technologies: Technology[]) => void;
  clearCurrentStack: () => void;
  importStack: (importedData: { name?: string; description?: string; nodes?: CanvasNode[]; connections?: Connection[] }) => void;
  
  // Stack management  
  saveStack: (stack: { name: string; description: string; nodes: CanvasNode[]; connections: Connection[]; is_public?: boolean }) => Promise<string | null>;
  deleteStack: (stackId: string) => Promise<void>;
  updateStack: (stackId: string, updates: Partial<Stack>) => Promise<void>;
  getStack: (stackId: string) => Promise<Stack | null>;
  getUserStacks: () => Promise<void>;
  
  // Favorites
  toggleFavorite: (stackId: string) => void;
  isFavorite: (stackId: string) => boolean;
}

export const useStackStore = create<StackState>()(
  devtools(
    persist(
      (set, get) => ({
        _hasHydrated: false,
        setHasHydrated: (hasHydrated: boolean) => {
          set({ _hasHydrated: hasHydrated }, false, 'setHasHydrated');
        },
        
        currentStack: {
          name: '',
          description: '',
          nodes: [],
          connections: [],
        },
        
        userStacks: [],
        favoriteStacks: [],
        
        // Builder actions
        setStackName: (name) =>
          set((state) => ({
            currentStack: { ...state.currentStack, name },
          }), false, 'setStackName'),
          
        setStackDescription: (description) =>
          set((state) => ({
            currentStack: { ...state.currentStack, description },
          }), false, 'setStackDescription'),
          
        addTechnology: (technology) =>
          set((state) => {
            // Convert Technology to CanvasNode for backwards compatibility
            const newNode: CanvasNode = {
              id: technology.id,
              name: technology.name,
              category: technology.category as string,
              description: technology.description,
              setupTimeHours: technology.setupTimeHours || 1,
              difficulty: technology.difficulty || 'beginner',
              pricing: technology.pricing || 'free',
              isMainTechnology: true,
              position: { x: Math.random() * 800, y: Math.random() * 600 },
              isCompact: true,
              width: 200,
              height: 80
            };
            
            const exists = state.currentStack.nodes.find(n => n.id === technology.id);
            if (exists) return state;
            
            return {
              currentStack: {
                ...state.currentStack,
                nodes: [...state.currentStack.nodes, newNode],
              },
            };
          }, false, 'addTechnology'),
          
        removeTechnology: (technologyId) =>
          set((state) => ({
            currentStack: {
              ...state.currentStack,
              nodes: state.currentStack.nodes.filter(n => n.id !== technologyId),
            },
          }), false, 'removeTechnology'),
          
        reorderTechnologies: (technologies) =>
          set((state) => {
            // Convert technologies to nodes
            const nodes = technologies.map(tech => {
              const existingNode = state.currentStack.nodes.find(n => n.id === tech.id);
              if (existingNode) return existingNode;
              
              return {
                id: tech.id,
                name: tech.name,
                category: tech.category as string,
                description: tech.description,
                setupTimeHours: tech.setupTimeHours || 1,
                difficulty: tech.difficulty || 'beginner',
                pricing: tech.pricing || 'free',
                isMainTechnology: true,
                position: { x: Math.random() * 800, y: Math.random() * 600 },
                isCompact: true,
                width: 200,
                height: 80
              } as CanvasNode;
            });
            
            return {
              currentStack: { ...state.currentStack, nodes },
            };
          }, false, 'reorderTechnologies'),
          
        clearCurrentStack: () =>
          set({
            currentStack: {
              name: '',
              description: '',
              nodes: [],
              connections: [],
            },
          }, false, 'clearCurrentStack'),

        importStack: (importedData) =>
          set((state) => ({
            currentStack: {
              name: importedData.name || state.currentStack.name || 'Imported Stack',
              description: importedData.description || state.currentStack.description || 'Imported from JSON file',
              nodes: importedData.nodes || [],
              connections: importedData.connections || [],
            },
          }), false, 'importStack'),
          
        // Stack management
        saveStack: async (stackData) => {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            throw new Error('User must be logged in to save stacks');
          }
          
          try {
            // First, ensure the user profile exists in the users table
            const { data: existingProfile } = await supabase
              .from('users')
              .select('id')
              .eq('id', user.id)
              .single();
            
            if (!existingProfile) {
              console.log('User profile not found, creating one...');
              // Create user profile if it doesn't exist
              const { error: profileError } = await supabase
                .from('users')
                .insert({
                  id: user.id,
                  email: user.email || '',
                  name: user.user_metadata?.name || user.user_metadata?.full_name || 'User',
                  bio: '',
                  website: '',
                  github: '',
                  twitter: '',
                  avatar_url: user.user_metadata?.avatar_url || '',
                });
              
              if (profileError) {
                console.error('Failed to create user profile:', profileError);
                throw new Error(`Failed to create user profile: ${profileError.message}`);
              }
            }
            
            // Now save the stack
            // Try with new format first (with nodes/connections)
            let data, error;
            try {
              const result = await supabase
                .from('stacks')
                .insert({
                  name: stackData.name,
                  description: stackData.description,
                  nodes: stackData.nodes,
                  connections: stackData.connections,
                  author_id: user.id,
                  is_public: stackData.is_public ?? true,
                })
                .select()
                .single();
              
              data = result.data;
              error = result.error;
            } catch (insertError: unknown) {
              // If columns don't exist yet, try without them (fallback)
              if ((insertError as Record<string, unknown>)?.message && 
                  typeof (insertError as Record<string, unknown>).message === 'string' &&
                  ((insertError as Record<string, unknown>).message as string).includes('column') && 
                  (((insertError as Record<string, unknown>).message as string).includes('nodes') || 
                   ((insertError as Record<string, unknown>).message as string).includes('connections'))) {
                console.log('Falling back to legacy format (missing nodes/connections columns)');
                const result = await supabase
                  .from('stacks')
                  .insert({
                    name: stackData.name,
                    description: stackData.description,
                    author_id: user.id,
                    is_public: stackData.is_public ?? true,
                  })
                  .select()
                  .single();
                
                data = result.data;
                error = result.error;
              } else {
                throw insertError;
              }
            }
            
            if (error) throw error;
            
            // Update local state
            set((state) => ({
              userStacks: [...state.userStacks, data as Stack],
            }), false, 'saveStack');
            
            return data.id;
          } catch (error: unknown) {
            console.error('Failed to save stack:', {
              message: (error as Record<string, unknown>)?.message,
              code: (error as Record<string, unknown>)?.code,
              details: (error as Record<string, unknown>)?.details,
              hint: (error as Record<string, unknown>)?.hint,
              fullError: error
            });
            throw error; // Re-throw to see the actual error in the UI
          }
        },
          
        deleteStack: async (stackId) => {
          const supabase = createClient();
          
          try {
            const { error } = await supabase
              .from('stacks')
              .delete()
              .eq('id', stackId);
            
            if (error) throw error;
            
            set((state) => ({
              userStacks: state.userStacks.filter(s => s.id !== stackId),
              favoriteStacks: state.favoriteStacks.filter(id => id !== stackId),
            }), false, 'deleteStack');
          } catch (error) {
            console.error('Failed to delete stack:', error);
          }
        },
          
        updateStack: async (stackId, updates) => {
          const supabase = createClient();
          
          try {
            const { data, error } = await supabase
              .from('stacks')
              .update(updates)
              .eq('id', stackId)
              .select()
              .single();
            
            if (error) throw error;
            
            set((state) => ({
              userStacks: state.userStacks.map(stack =>
                stack.id === stackId ? { ...stack, ...data } : stack
              ),
            }), false, 'updateStack');
          } catch (error) {
            console.error('Failed to update stack:', error);
          }
        },
        
        getStack: async (stackId) => {
          const supabase = createClient();
          
          try {
            const { data, error } = await supabase
              .from('stacks')
              .select(`
                *,
                users!stacks_author_id_fkey (
                  name,
                  avatar_url
                )
              `)
              .eq('id', stackId)
              .single();
            
            if (error) throw error;
            
            return {
              ...data,
              author: {
                name: data.users?.name || 'Unknown',
                avatar: data.users?.avatar_url
              }
            } as Stack;
          } catch (error) {
            console.error('Failed to get stack:', error);
            return null;
          }
        },
        
        getUserStacks: async () => {
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) return;
          
          try {
            const { data, error } = await supabase
              .from('stacks')
              .select('*')
              .eq('author_id', user.id)
              .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            set({ userStacks: data as Stack[] }, false, 'getUserStacks');
          } catch (error) {
            console.error('Failed to get user stacks:', error);
          }
        },
          
        // Favorites
        toggleFavorite: (stackId) =>
          set((state) => {
            const isFavorite = state.favoriteStacks.includes(stackId);
            return {
              favoriteStacks: isFavorite
                ? state.favoriteStacks.filter(id => id !== stackId)
                : [...state.favoriteStacks, stackId],
            };
          }, false, 'toggleFavorite'),
          
        isFavorite: (stackId) => get().favoriteStacks.includes(stackId),
      }),
      {
        name: 'stack-store',
        partialize: (state) => ({
          userStacks: state.userStacks,
          favoriteStacks: state.favoriteStacks,
        }),
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
      }
    ),
    { name: 'stack-store' }
  )
);