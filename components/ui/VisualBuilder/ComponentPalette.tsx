'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { NodeData, SubTechnology } from './CanvasNode';
import { dragVariants, containerVariants, listItemVariants } from '@/lib/animations/variants';
import { 
  Search, 
  Plus, 
  X,
  Grip,
  Users,
  Star,
  Download,
  ExternalLink,
  Package
} from 'lucide-react';
import Link from 'next/link';
import { componentsApi, type Component as CommunityComponent } from '@/lib/api/components';

interface ComponentPaletteProps {
  availableComponents: NodeData[];
  subTechnologies: SubTechnology[];
  onAddComponent: (component: NodeData) => void;
  usedComponentIds: string[];
  className?: string;
}

// Extended NodeData interface for community components
interface CommunityNodeData extends NodeData {
  rating?: number;
  usageCount?: number;
  author?: string;
  logoUrl?: string;
  githubUrl?: string;
  npmUrl?: string;
  officialDocsUrl?: string;
  tags?: string[];
}

// Convert community component to NodeData format
const convertCommunityToNodeData = (component: CommunityComponent): CommunityNodeData => {
  return {
    id: component.id,
    name: component.name,
    category: component.category as NodeData['category'],
    description: component.description,
    setupTimeHours: component.setupTimeHours,
    difficulty: component.difficulty as NodeData['difficulty'],
    pricing: component.pricing as NodeData['pricing'],
    isMainTechnology: component.type === 'main',
    // Add all the missing fields that official components have
    logoUrl: component.logoUrl,
    githubUrl: component.githubUrl,
    npmUrl: component.npmUrl,
    officialDocsUrl: component.officialDocsUrl,
    tags: component.tags || [],
    compatibleWith: component.compatibleWith || [],
    // Community-specific fields
    rating: component.rating,
    usageCount: component.usageCount,
    author: component.author.name
  };
};

const defaultCategoryIcons = {
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
  linting: '✅',
  imported: '📥'
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
  const [showCommunity, setShowCommunity] = useState(false);
  const [communityComponents, setCommunityComponents] = useState<CommunityNodeData[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [importedComponents, setImportedComponents] = useState<CommunityNodeData[]>([]);
  
  // Use default category icons
  const categoryIcons = defaultCategoryIcons;

  // Load community components when tab is switched
  useEffect(() => {
    if (showCommunity && communityComponents.length === 0) {
      loadCommunityComponents();
    }
  }, [showCommunity]);

  // Load imported components from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('importedComponents');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setImportedComponents(parsed);
      } catch (error) {
        console.error('Failed to parse imported components:', error);
      }
    }
  }, []);

  // Save imported components to localStorage
  const saveImportedComponent = (component: CommunityNodeData) => {
    const newImported = [...importedComponents];
    // Avoid duplicates
    if (!newImported.find(c => c.id === component.id)) {
      newImported.unshift(component); // Add to beginning
      // Keep only last 20 imported components
      if (newImported.length > 20) {
        newImported.splice(20);
      }
      setImportedComponents(newImported);
      localStorage.setItem('importedComponents', JSON.stringify(newImported));
    }
  };

  const loadCommunityComponents = async () => {
    try {
      setLoadingCommunity(true);
      const components = await componentsApi.getComponents();
      const convertedComponents = components.map(convertCommunityToNodeData);
      setCommunityComponents(convertedComponents);
    } catch (error) {
      console.error('Failed to load community components:', error);
    } finally {
      setLoadingCommunity(false);
    }
  };

  // Get unique categories with counts (including imported components)
  const categories = useMemo(() => {
    const categoryCount: Record<string, number> = {};
    
    // Count official components
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

    // Count imported components in their respective categories
    importedComponents.forEach(comp => {
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

    // Add imported components as separate category if we have any
    if (importedComponents.length > 0) {
      categoryCount['imported'] = importedComponents.length;
    }
    
    return Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort();
  }, [availableComponents, subTechnologies, importedComponents]);

  // Filter components
  const filteredComponents = useMemo(() => {
    let componentsToFilter: NodeData[];
    
    if (showCommunity) {
      componentsToFilter = communityComponents;
    } else {
      // For Available tab
      if (selectedCategory === 'imported') {
        // Show only imported components
        componentsToFilter = importedComponents;
      } else {
        // Always combine official and imported components for all categories
        componentsToFilter = [...availableComponents, ...importedComponents];
      }
    }
    
    return componentsToFilter.filter(component => {
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
      
      // Special handling for imported category
      if (selectedCategory === 'imported') {
        return matchesSearch;
      }
      
      const matchesCategory = !selectedCategory || displayCategory === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [availableComponents, subTechnologies, searchQuery, selectedCategory, showCommunity, communityComponents, importedComponents]);

  // Group components by category
  const groupedComponents = useMemo(() => {
    const groups: Record<string, NodeData[]> = {};
    filteredComponents.forEach(component => {
      let displayCategory = component.category;
      
      // Special handling for imported components
      if (selectedCategory === 'imported') {
        displayCategory = 'other' as NodeData['category'];
      } else {
        // Map sub-technologies to proper category
        if (component.isMainTechnology === false) {
          const subTech = subTechnologies.find(st => st.id === component.id);
          if (subTech) {
            displayCategory = mapSubTechToCategory(subTech.type);
          }
        }
      }
      
      if (!groups[displayCategory]) {
        groups[displayCategory] = [];
      }
      groups[displayCategory].push(component);
    });
    return groups;
  }, [filteredComponents, subTechnologies, selectedCategory]);

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
        
        {/* Tabs */}
        <div className="flex mb-3 border-b border-slate-700 -mx-4 px-4">
          <button
            onClick={() => setShowCommunity(false)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              !showCommunity 
                ? "text-white border-blue-500" 
                : "text-slate-400 border-transparent hover:text-slate-200"
            )}
          >
            Available
          </button>
          <button
            onClick={() => setShowCommunity(true)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px flex items-center gap-2",
              showCommunity 
                ? "text-white border-blue-500" 
                : "text-slate-400 border-transparent hover:text-slate-200"
            )}
          >
            <Users className="w-4 h-4" />
            Community
            <Badge variant="primary" size="sm">New</Badge>
          </button>
        </div>
        
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
        {showCommunity ? (
          /* Community Components - Same design as official */
          <>
            {/* Community Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-white">Community Components</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Discover components shared by the community
                </p>
              </div>
              <Link href="/components" target="_blank">
                <Button variant="ghost" size="sm" className="text-xs">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Browse All
                </Button>
              </Link>
            </div>

            {/* Loading state */}
            {loadingCommunity && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-sm text-slate-400">Loading community components...</p>
              </div>
            )}

            {/* Community Components - Same format as official */}
            {!loadingCommunity && (
              <div className="space-y-2">
                {Object.entries(groupedComponents).map(([category, components]) => (
                  <div key={category}>
                    {searchQuery && !selectedCategory && (
                      <h4 className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-2">
                        <span>{categoryIcons[category as keyof typeof categoryIcons]}</span>
                        {category === 'imported' ? 'Recently Imported' : category}
                      </h4>
                    )}
                    
                    {components.map(component => {
                      const isUsed = usedComponentIds.includes(component.id);
                      const communityComp = component as CommunityNodeData;
                      
                      return (
                        <div
                          key={component.id}
                          className={cn(
                            'flex items-center justify-between p-3 bg-slate-800/30 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-all duration-200 border border-transparent hover:border-slate-600',
                            isUsed && 'opacity-50 cursor-not-allowed',
                            'border-l-4 border-l-blue-500/30' // Community indicator
                          )}
                          onClick={() => {
                            if (!isUsed) {
                              // Save to imported components when used
                              saveImportedComponent(communityComp);
                              // Track usage
                              componentsApi.trackUsage(component.id).catch(console.error);
                              // Add to builder
                              onAddComponent(component);
                            }
                          }}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="text-blue-400 text-sm">🌐</div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-slate-200 text-sm">
                                <span className="truncate">{component.name}</span>
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
                                {communityComp.rating && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                    <span className="text-xs text-white">{communityComp.rating.toFixed(1)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {isUsed ? (
                            <span className="text-xs text-blue-400">Added</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Grip className="h-4 w-4 text-slate-500" />
                              <Plus className="h-4 w-4 text-slate-400" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loadingCommunity && filteredComponents.length === 0 && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm text-slate-400">No community components found</p>
                <Link href="/components" target="_blank" className="text-blue-400 hover:text-blue-300 text-sm mt-2 block">
                  Browse all components
                </Link>
              </div>
            )}
          </>
        ) : (
          /* Official Components */
          <>
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
                          <div className="font-medium text-slate-200 capitalize">
                            {category === 'imported' ? 'Recently Imported' : category}
                          </div>
                          <div className="text-xs text-slate-400">{count} components</div>
                        </div>
                      </div>
                      <Badge variant={category === 'imported' ? 'primary' : 'default'} size="sm">{count}</Badge>
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
                      {selectedCategory === 'imported' ? 'Recently Imported' : selectedCategory}
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
                          {category === 'imported' ? 'Recently Imported' : category}
                        </h4>
                      )}
                      
                      {components.map(component => {
                        const isUsed = usedComponentIds.includes(component.id);
                        const isImported = importedComponents.some(ic => ic.id === component.id);
                        const communityComp = component as CommunityNodeData;
                        
                        return (
                          <div
                            key={component.id}
                            className={cn(
                              'flex items-center justify-between p-3 bg-slate-800/30 hover:bg-slate-800/50 rounded-lg cursor-pointer transition-all duration-200 border border-transparent hover:border-slate-600',
                              isUsed && 'opacity-50 cursor-not-allowed',
                              component.isMainTechnology === false && 'border-l-4 border-l-orange-500/50 bg-orange-900/10',
                              isImported && component.isMainTechnology !== false && 'border-l-4 border-l-blue-500/30'
                            )}
                            onClick={() => !isUsed && onAddComponent(component)}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {component.isMainTechnology === false ? (
                                <div className="text-orange-400 text-sm">🛠️</div>
                              ) : isImported ? (
                                <div className="text-blue-400 text-sm">🌐</div>
                              ) : (
                                <div className="text-slate-400 text-sm">📦</div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-slate-200 text-sm flex items-center gap-1">
                                  {component.isMainTechnology === false && (
                                    <span className="text-xs text-orange-400">TOOL</span>
                                  )}
                                  <span className="truncate">{component.name}</span>
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
                                  {isImported && communityComp.rating && (
                                    <div className="flex items-center gap-1">
                                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                      <span className="text-xs text-white">{communityComp.rating.toFixed(1)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {isUsed ? (
                              <span className="text-xs text-blue-400">Added</span>
                            ) : (
                              <div className="flex items-center gap-2">
                                <Grip className="h-4 w-4 text-slate-500" />
                                <Plus className="h-4 w-4 text-slate-400" />
                              </div>
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
          </>
        )}
      </div>
    </div>
  );
};