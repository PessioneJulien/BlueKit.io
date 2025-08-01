import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { AnimatedModal } from '@/components/ui/animated/AnimatedModal';
import { AnimatedCard } from '@/components/ui/animated/AnimatedCard';
import { useCategoryStore, CustomCategory, DEFAULT_CATEGORIES } from '@/lib/stores/categoryStore';
import { listItemVariants, containerVariants } from '@/lib/animations/variants';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Palette, 
  Tag,
  Save,
  Folder,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface CategoryFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
}

const EMOJI_OPTIONS = [
  '📦', '🔧', '⚡', '🎯', '🛠️', '💎', '🎪', '🎭',
  '🎨', '🎮', '🎵', '🎬', '📊', '📈', '📉', '📋',
  '🔍', '🔐', '🔑', '🔒', '🎲', '🎳', '🎪', '🎡'
];

const COLOR_OPTIONS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#C026D3',
  '#EC4899', '#F43F5E', '#64748B', '#6B7280', '#374151'
];

export function CategoryManager({ isOpen, onClose, className }: CategoryManagerProps) {
  const { 
    customCategories, 
    addCategory, 
    updateCategory, 
    deleteCategory,
    activeFilters,
    toggleFilter,
    clearFilters
  } = useCategoryStore();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    color: COLOR_OPTIONS[0],
    icon: EMOJI_OPTIONS[0]
  });

  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: COLOR_OPTIONS[0],
      icon: EMOJI_OPTIONS[0]
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;

    if (editingId) {
      updateCategory(editingId, formData);
    } else {
      addCategory(formData);
    }
    
    resetForm();
  };

  const handleEdit = (category: CustomCategory) => {
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon
    });
    setEditingId(category.id);
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    deleteCategory(id);
  };

  const isDefaultCategory = (id: string) => {
    return DEFAULT_CATEGORIES.some(cat => cat.id === id);
  };

  return (
    <AnimatedModal 
      isOpen={isOpen} 
      onClose={onClose}
      className={cn(
        'relative w-full max-w-4xl mx-4 bg-slate-900 border-slate-700 max-h-[90vh] overflow-hidden rounded-lg border',
        className
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Folder className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Category Manager</h2>
              <p className="text-sm text-slate-400 font-normal">
                Organize your technologies with custom categories
              </p>
            </div>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
        {/* Quick Filter Bar */}
        <div className="flex flex-wrap gap-2 p-4 bg-slate-800/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2 w-full">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-300">Quick Filters:</span>
            {activeFilters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs"
              >
                Clear all
              </Button>
            )}
          </div>
          {allCategories.map((category, index) => (
            <motion.button
              key={category.id}
              variants={listItemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.05 }}
              onClick={() => toggleFilter(category.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all duration-200 border',
                activeFilters.includes(category.id)
                  ? 'bg-opacity-20 border-opacity-50 text-white'
                  : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700'
              )}
              style={{
                backgroundColor: activeFilters.includes(category.id) 
                  ? `${category.color}20` 
                  : undefined,
                borderColor: activeFilters.includes(category.id) 
                  ? `${category.color}50` 
                  : undefined
              }}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Add New Category Button */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Your Categories</h3>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Category
          </Button>
        </div>

        {/* Category Creation/Edit Form */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card variant="glass" className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Tag className="w-5 h-5 text-blue-400" />
                    <h4 className="text-lg font-semibold text-white">
                      {editingId ? 'Edit Category' : 'Create New Category'}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Category Name
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., My Custom Stack"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Description
                      </label>
                      <Input
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief description..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Icon
                      </label>
                      <div className="grid grid-cols-8 gap-2">
                        {EMOJI_OPTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setFormData({ ...formData, icon: emoji })}
                            className={cn(
                              'p-2 rounded-lg text-lg transition-all duration-200 hover:scale-110',
                              formData.icon === emoji
                                ? 'bg-blue-500/20 ring-2 ring-blue-500'
                                : 'bg-slate-700/50 hover:bg-slate-700'
                            )}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Color
                      </label>
                      <div className="grid grid-cols-5 gap-2">
                        {COLOR_OPTIONS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setFormData({ ...formData, color })}
                            className={cn(
                              'w-8 h-8 rounded-lg transition-all duration-200 hover:scale-110',
                              formData.color === color && 'ring-2 ring-white'
                            )}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h5 className="text-sm font-medium text-slate-300 mb-2">Preview:</h5>
                    <div 
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                      style={{ 
                        backgroundColor: `${formData.color}20`,
                        border: `1px solid ${formData.color}50`,
                        color: formData.color
                      }}
                    >
                      <span>{formData.icon}</span>
                      <span>{formData.name || 'Category Name'}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {editingId ? 'Update' : 'Create'} Category
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={resetForm}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories List */}
        <motion.div 
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Default Categories */}
          <div>
            <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              System Categories
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DEFAULT_CATEGORIES.map((category, index) => (
                <AnimatedCard
                  key={category.id}
                  className="p-4 border border-slate-600/50 bg-slate-800/30 backdrop-blur-sm rounded-lg"
                  delay={index * 0.1}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        {category.icon}
                      </div>
                      <div>
                        <h5 className="font-semibold text-white">{category.name}</h5>
                        <p className="text-sm text-slate-400">{category.description}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      size="sm"
                      className="text-xs"
                    >
                      System
                    </Badge>
                  </div>
                </AnimatedCard>
              ))}
            </div>
          </div>

          {/* Custom Categories */}
          {customCategories.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Custom Categories ({customCategories.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {customCategories.map((category, index) => (
                  <AnimatedCard
                    key={category.id}
                    className="p-4 border border-slate-600/50 bg-slate-800/30 backdrop-blur-sm rounded-lg"
                    delay={index * 0.1}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          {category.icon}
                        </div>
                        <div>
                          <h5 className="font-semibold text-white">{category.name}</h5>
                          <p className="text-sm text-slate-400">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                          className="p-1"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                          className="p-1 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {customCategories.length === 0 && (
            <Card variant="glass" className="p-8 text-center">
              <Folder className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">
                No Custom Categories Yet
              </h4>
              <p className="text-slate-400 mb-4">
                Create your first custom category to better organize your technologies.
              </p>
              <Button
                variant="primary"
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Your First Category
              </Button>
            </Card>
          )}
        </motion.div>
      </CardContent>
    </AnimatedModal>
  );
}