import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useCategoryStore } from '@/lib/stores/categoryStore';
import { ChevronDown, Check, Tag, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategorySelectorProps {
  selectedCategoryId?: string;
  onSelect: (categoryId: string) => void;
  onOpenCategoryManager?: () => void;
  className?: string;
  placeholder?: string;
}

export function CategorySelector({ 
  selectedCategoryId, 
  onSelect, 
  onOpenCategoryManager,
  className,
  placeholder = "Select category..." 
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { getAllCategories } = useCategoryStore();
  
  const allCategories = getAllCategories();
  const selectedCategory = allCategories.find(cat => cat.id === selectedCategoryId);

  const handleSelect = (categoryId: string) => {
    onSelect(categoryId);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Trigger Button */}
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full justify-between h-10 px-3 py-2 bg-slate-800 border border-slate-600 hover:border-slate-500",
          selectedCategory && "text-white"
        )}
      >
        <div className="flex items-center gap-2">
          {selectedCategory ? (
            <>
              <span 
                className="w-4 h-4 rounded flex items-center justify-center text-xs"
                style={{ backgroundColor: `${selectedCategory.color}20` }}
              >
                {selectedCategory.icon}
              </span>
              <span>{selectedCategory.name}</span>
            </>
          ) : (
            <>
              <Tag className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400">{placeholder}</span>
            </>
          )}
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </Button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu */}
            <motion.div
              className="absolute top-full left-0 right-0 z-20 mt-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <Card className="bg-slate-800 border-slate-600 shadow-xl max-h-64 overflow-y-auto">
                <div className="p-1">
                  {/* Create New Category Option */}
                  {onOpenCategoryManager && (
                    <>
                      <button
                        onClick={() => {
                          onOpenCategoryManager();
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-blue-400 hover:bg-slate-700/50 rounded transition-colors"
                      >
                        <div className="w-4 h-4 rounded border border-dashed border-blue-400 flex items-center justify-center">
                          <Plus className="w-3 h-3" />
                        </div>
                        Create new category
                      </button>
                      <div className="my-1 h-px bg-slate-700" />
                    </>
                  )}
                  
                  {/* Category Options */}
                  {allCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleSelect(category.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-slate-700/50 rounded transition-colors",
                        selectedCategoryId === category.id 
                          ? "bg-slate-700/70 text-white" 
                          : "text-slate-300"
                      )}
                    >
                      <div 
                        className="w-4 h-4 rounded flex items-center justify-center text-xs"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        {category.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{category.name}</div>
                        {category.description && (
                          <div className="text-xs text-slate-400 truncate">
                            {category.description}
                          </div>
                        )}
                      </div>
                      {selectedCategoryId === category.id && (
                        <Check className="w-4 h-4 text-blue-400" />
                      )}
                    </button>
                  ))}
                  
                  {/* Empty State */}
                  {allCategories.length === 0 && (
                    <div className="px-3 py-6 text-center text-slate-400">
                      <Tag className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No categories available</p>
                      {onOpenCategoryManager && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            onOpenCategoryManager();
                            setIsOpen(false);
                          }}
                          className="mt-2"
                        >
                          Create first category
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}