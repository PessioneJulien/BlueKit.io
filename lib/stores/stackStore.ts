import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Technology } from '@/components/ui/TechnologyCard';

export interface Stack {
  id: string;
  name: string;
  description: string;
  technologies: Technology[];
  author: string;
  stars: number;
  uses: number;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  category: string;
  createdAt: string;
  isPublic: boolean;
}

interface StackState {
  // Current builder state
  currentStack: {
    name: string;
    description: string;
    technologies: Technology[];
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
  
  // Stack management
  saveStack: (stack: Omit<Stack, 'id' | 'createdAt'>) => void;
  deleteStack: (stackId: string) => void;
  updateStack: (stackId: string, updates: Partial<Stack>) => void;
  
  // Favorites
  toggleFavorite: (stackId: string) => void;
  isFavorite: (stackId: string) => boolean;
}

export const useStackStore = create<StackState>()(
  devtools(
    persist(
      (set, get) => ({
        currentStack: {
          name: '',
          description: '',
          technologies: [],
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
            const exists = state.currentStack.technologies.find(t => t.id === technology.id);
            if (exists) return state;
            
            return {
              currentStack: {
                ...state.currentStack,
                technologies: [...state.currentStack.technologies, technology],
              },
            };
          }, false, 'addTechnology'),
          
        removeTechnology: (technologyId) =>
          set((state) => ({
            currentStack: {
              ...state.currentStack,
              technologies: state.currentStack.technologies.filter(t => t.id !== technologyId),
            },
          }), false, 'removeTechnology'),
          
        reorderTechnologies: (technologies) =>
          set((state) => ({
            currentStack: { ...state.currentStack, technologies },
          }), false, 'reorderTechnologies'),
          
        clearCurrentStack: () =>
          set({
            currentStack: {
              name: '',
              description: '',
              technologies: [],
            },
          }, false, 'clearCurrentStack'),
          
        // Stack management
        saveStack: (stackData) =>
          set((state) => {
            const newStack: Stack = {
              ...stackData,
              id: Date.now().toString(),
              createdAt: new Date().toISOString(),
            };
            
            return {
              userStacks: [...state.userStacks, newStack],
            };
          }, false, 'saveStack'),
          
        deleteStack: (stackId) =>
          set((state) => ({
            userStacks: state.userStacks.filter(s => s.id !== stackId),
            favoriteStacks: state.favoriteStacks.filter(id => id !== stackId),
          }), false, 'deleteStack'),
          
        updateStack: (stackId, updates) =>
          set((state) => ({
            userStacks: state.userStacks.map(stack =>
              stack.id === stackId ? { ...stack, ...updates } : stack
            ),
          }), false, 'updateStack'),
          
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
      }
    ),
    { name: 'stack-store' }
  )
);