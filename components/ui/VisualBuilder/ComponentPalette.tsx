'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { NodeData, SubTechnology } from './CanvasNode';
import { 
  Search, 
  Plus, 
  X
} from 'lucide-react';

interface ComponentPaletteProps {
  availableComponents: NodeData[];
  subTechnologies: SubTechnology[];
  onAddComponent: (component: NodeData) => void;
  usedComponentIds: string[];
  className?: string;
}

const categoryIcons = {
  frontend: '🎨',
  backend: '⚙️',
  database: '💾',
  devops: '🚀',
  mobile: '📱',
  ai: '🧠',
  other: '🔧',
  testing: '🧪',
  'ui-ux': '🎨',
  'state-management': '📊',
  routing: '🗺️',
  documentation: '📚',
  'build-tools': '🔨',
  linting: '✅'
};

// Map sub-technology types to display categories
const mapSubTechToCategory = (subTechType: string): NodeData['category'] => {
  const mapping: Record<string, NodeData['category']> = {
    'styling': 'ui-ux',
    'testing': 'testing',
    'documentation': 'documentation',
    'state-management': 'state-management',
    'routing': 'routing',
    'build-tool': 'build-tools',
    'linting': 'linting',
    'deployment': 'devops'
  };
  return mapping[subTechType] || 'other';
};

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({
  availableComponents,
  subTechnologies,
  onAddComponent,
  usedComponentIds,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Get unique categories with counts
  const categories = useMemo(() => {
    const categoryCount: Record<string, number> = {};
    availableComponents.forEach(comp => {
      let displayCategory = comp.category;
      
      // For sub-technologies, find the proper category based on type
      if (comp.isMainTechnology === false) {
        const subTech = subTechnologies.find(st => st.id === comp.id);
        if (subTech) {
          displayCategory = mapSubTechToCategory(subTech.type);
        }
      }
      
      categoryCount[displayCategory] = (categoryCount[displayCategory] || 0) + 1;
    });
    
    return Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort();
  }, [availableComponents, subTechnologies]);

  // Filter components
  const filteredComponents = useMemo(() => {
    return availableComponents.filter(component => {
      const matchesSearch = 
        component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        component.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Map sub-technologies to proper category for filtering
      let displayCategory = component.category;
      if (component.isMainTechnology === false) {
        const subTech = subTechnologies.find(st => st.id === component.id);
        if (subTech) {
          displayCategory = mapSubTechToCategory(subTech.type);
        }
      }
      
      const matchesCategory = !selectedCategory || displayCategory === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [availableComponents, subTechnologies, searchQuery, selectedCategory]);

  // Group components by category
  const groupedComponents = useMemo(() => {
    const groups: Record<string, NodeData[]> = {};
    filteredComponents.forEach(component => {
      // Map sub-technologies to proper category
      let displayCategory = component.category;
      if (component.isMainTechnology === false) {
        const subTech = subTechnologies.find(st => st.id === component.id);
        if (subTech) {
          displayCategory = mapSubTechToCategory(subTech.type);
        }
      }
      
      if (!groups[displayCategory]) {
        groups[displayCategory] = [];
      }
      groups[displayCategory].push(component);
    });
    return groups;
  }, [filteredComponents, subTechnologies]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory || searchQuery;

  return (
    <div className={cn('flex flex-col h-full bg-slate-900/50 backdrop-blur-md border-r border-slate-700', className)}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-slate-100 mb-3">Components</h2>
        
        {/* Search */}
        <Input
          placeholder="Search components..."
          icon={<Search className="h-4 w-4" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-3"
        />

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-slate-400 hover:text-slate-200 mb-3"
          >
            <X className="h-4 w-4 mr-2" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Category View */}
        {!searchQuery && !selectedCategory && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Categories</h3>
            {categories.map(({ category, count }) => (
              <Button
                key={category}
                variant="ghost"
                className="w-full justify-start p-3 h-auto"
                onClick={() => setSelectedCategory(category)}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{categoryIcons[category as keyof typeof categoryIcons]}</div>
                    <div className="text-left">
                      <div className="font-medium text-slate-200 capitalize">{category}</div>
                      <div className="text-xs text-slate-400">{count} components</div>
                    </div>
                  </div>
                  <Badge variant="default" size="sm">{count}</Badge>
                </div>
              </Button>
            ))}
          </div>
        )}

        {/* Components View */}
        {(searchQuery || selectedCategory) && (
          <>
            {selectedCategory && (
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <span>{categoryIcons[selectedCategory as keyof typeof categoryIcons]}</span>
                  {selectedCategory}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory('')}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="space-y-2">
              {Object.entries(groupedComponents).map(([category, components]) => (
                <div key={category}>
                  {searchQuery && !selectedCategory && (
                    <h4 className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-2">
                      <span>{categoryIcons[category as keyof typeof categoryIcons]}</span>
                      {category}
                    </h4>
                  )}
                  
                  {components.map(component => {
                    const isUsed = usedComponentIds.includes(component.id);
                    
                    return (
                      <div
                        key={component.id}
                        className={cn(
                          'flex items-center justify-between p-3 bg-slate-800/30 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-all duration-200 border border-transparent hover:border-slate-600',
                          isUsed && 'opacity-50',
                          component.isMainTechnology === false && 'border-l-4 border-l-orange-500/50 bg-orange-900/10'
                        )}
                        onClick={() => !isUsed && onAddComponent(component)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {component.isMainTechnology === false && (
                            <div className="text-orange-400 text-sm">🛠️</div>
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-slate-200 text-sm flex items-center gap-1">
                              {component.isMainTechnology === false && (
                                <span className="text-xs text-orange-400">TOOL</span>
                              )}
                              {component.name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant={component.pricing === 'free' ? 'success' : component.pricing === 'freemium' ? 'warning' : 'danger'}
                                size="sm"
                                outline
                              >
                                {component.pricing}
                              </Badge>
                              <div className="text-xs text-slate-400">
                                {component.setupTimeHours}h setup
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {isUsed ? (
                          <span className="text-xs text-blue-400">Added</span>
                        ) : (
                          <Plus className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </>
        )}
        
        {(searchQuery || selectedCategory) && filteredComponents.length === 0 && (
          <div className="text-center py-8">
            <div className="text-slate-400 mb-2">No components found</div>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};