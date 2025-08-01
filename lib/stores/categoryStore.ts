import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CustomCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  createdAt: Date;
  userId?: string;
}

interface CategoryStoreState {
  customCategories: CustomCategory[];
  activeFilters: string[];
  
  // Actions
  addCategory: (category: Omit<CustomCategory, 'id' | 'createdAt'>) => void;
  updateCategory: (id: string, updates: Partial<CustomCategory>) => void;
  deleteCategory: (id: string) => void;
  toggleFilter: (categoryId: string) => void;
  clearFilters: () => void;
  getCategoryById: (id: string) => CustomCategory | undefined;
  getAllCategories: () => CustomCategory[];
}

// Catégories par défaut du système
export const DEFAULT_CATEGORIES = [
  {
    id: 'frontend',
    name: 'Frontend',
    description: 'User interface frameworks and libraries',
    color: '#3B82F6',
    icon: '💻',
    createdAt: new Date(),
  },
  {
    id: 'backend',
    name: 'Backend',
    description: 'Server-side frameworks and APIs',
    color: '#10B981',
    icon: '⚙️',
    createdAt: new Date(),
  },
  {
    id: 'database',
    name: 'Database',
    description: 'Data storage and management systems',
    color: '#8B5CF6',
    icon: '🗄️',
    createdAt: new Date(),
  },
  {
    id: 'devops',
    name: 'DevOps',
    description: 'Deployment and infrastructure tools',
    color: '#F59E0B',
    icon: '🚀',
    createdAt: new Date(),
  },
  {
    id: 'mobile',
    name: 'Mobile',
    description: 'Mobile application development',
    color: '#EC4899',
    icon: '📱',
    createdAt: new Date(),
  },
  {
    id: 'ai',
    name: 'AI/ML',
    description: 'Artificial Intelligence and Machine Learning',
    color: '#F97316',
    icon: '🤖',
    createdAt: new Date(),
  },
  {
    id: 'testing',
    name: 'Testing',
    description: 'Testing frameworks and tools',
    color: '#06B6D4',
    icon: '🧪',
    createdAt: new Date(),
  },
  {
    id: 'ui-ux',
    name: 'UI/UX',
    description: 'Design systems and styling tools',
    color: '#EF4444',
    icon: '🎨',
    createdAt: new Date(),
  }
];

export const useCategoryStore = create<CategoryStoreState>()(
  persist(
    (set, get) => ({
      customCategories: [],
      activeFilters: [],

      addCategory: (categoryData) => {
        const newCategory: CustomCategory = {
          ...categoryData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        };

        set((state) => ({
          customCategories: [...state.customCategories, newCategory],
        }));
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          customCategories: state.customCategories.map((category) =>
            category.id === id ? { ...category, ...updates } : category
          ),
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          customCategories: state.customCategories.filter((category) => category.id !== id),
          activeFilters: state.activeFilters.filter((filterId) => filterId !== id),
        }));
      },

      toggleFilter: (categoryId) => {
        set((state) => ({
          activeFilters: state.activeFilters.includes(categoryId)
            ? state.activeFilters.filter((id) => id !== categoryId)
            : [...state.activeFilters, categoryId],
        }));
      },

      clearFilters: () => {
        set({ activeFilters: [] });
      },

      getCategoryById: (id) => {
        const state = get();
        return [...DEFAULT_CATEGORIES, ...state.customCategories].find(
          (category) => category.id === id
        );
      },

      getAllCategories: () => {
        const state = get();
        return [...DEFAULT_CATEGORIES, ...state.customCategories];
      },
    }),
    {
      name: 'category-store',
      partialize: (state) => ({
        customCategories: state.customCategories,
        activeFilters: state.activeFilters,
      }),
    }
  )
);