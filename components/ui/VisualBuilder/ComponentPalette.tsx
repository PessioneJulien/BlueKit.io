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
  onOpenCustomContainerModal?: () => void;
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
  onOpenCustomContainerModal,
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
              "px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px",
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
              "px-3 py-2 text-xs font-medium transition-colors border-b-2 -mb-px flex items-center gap-1.5",
              showCommunity 
                ? "text-white border-blue-500" 
                : "text-slate-400 border-transparent hover:text-slate-200"
            )}
          >
            <Users className="w-3 h-3" />
            Community
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" title="New"></div>
          </button>
        </div>
        
        

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
                          draggable={!isUsed}
                          onDragStart={(e) => {
                            if (!isUsed) {
                              e.dataTransfer.effectAllowed = 'copy';
                              e.dataTransfer.setData('application/json', JSON.stringify({
                                type: 'community-component',
                                component: component
                              }));
                              e.currentTarget.style.opacity = '0.5';
                            }
                          }}
                          onDragEnd={(e) => {
                            e.currentTarget.style.opacity = '';
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
            {/* Components Grid - Always visible */}
            <div className="space-y-4">
              {/* Components Grid */}
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(groupedComponents).length === 0 || Object.values(groupedComponents).flat().length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-slate-400">
                    <div className="text-4xl mb-2">📦</div>
                    <p className="text-sm">Aucun composant trouvé</p>
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-2">
                      Réinitialiser les filtres
                    </Button>
                  </div>
                ) : (
                  Object.entries(groupedComponents).map(([category, components]) => (
                    components.map(component => {
                    const isUsed = usedComponentIds.includes(component.id);
                    const isImported = importedComponents.some(ic => ic.id === component.id);
                    const communityComp = component as CommunityNodeData;
                    
                    return (
                      <div
                        key={component.id}
                        className={`relative bg-slate-800/30 rounded-lg border border-slate-700/50 p-3 transition-all duration-200 cursor-pointer group ${
                          isUsed 
                            ? 'opacity-60 cursor-not-allowed' 
                            : 'hover:bg-slate-800/50 hover:border-slate-600 hover:scale-105'
                        } ${
                          component.isMainTechnology === false && 'border-l-4 border-l-orange-500/50'
                        } ${
                          isImported && component.isMainTechnology !== false && 'border-l-4 border-l-blue-500/50'
                        }`}
                        onClick={() => !isUsed && onAddComponent(component)}
                        draggable={!isUsed}
                        onDragStart={(e) => {
                          if (!isUsed) {
                            const dragType = component.isMainTechnology === false ? 'tool' : 'main-component';
                            e.dataTransfer.effectAllowed = 'copy';
                            e.dataTransfer.setData('application/json', JSON.stringify({
                              type: dragType,
                              component: component
                            }));
                            e.currentTarget.style.opacity = '0.5';
                          }
                        }}
                        onDragEnd={(e) => {
                          e.currentTarget.style.opacity = '';
                        }}
                      >
                        {/* Icône */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg mb-2 ${
                          component.isMainTechnology === false ? 'bg-gradient-to-br from-orange-500 to-red-600' :
                          isImported ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
                          component.category === 'frontend' ? 'bg-gradient-to-br from-pink-500 to-rose-600' :
                          component.category === 'backend' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                          component.category === 'database' ? 'bg-gradient-to-br from-emerald-500 to-green-600' :
                          'bg-gradient-to-br from-purple-500 to-violet-600'
                        }`}>
                          {component.isMainTechnology === false ? '🛠️' :
                           isImported ? '🌐' :
                           component.category === 'frontend' ? '🎨' :
                           component.category === 'backend' ? '⚙️' :
                           component.category === 'database' ? '💾' : '🚀'}
                        </div>

                        {/* Nom */}
                        <div className="font-medium text-slate-200 text-sm mb-2 truncate">
                          {component.name}
                        </div>

                        {/* Badges essentiels */}
                        <div className="flex flex-wrap gap-1 mb-2">
                          {component.isMainTechnology === false && (
                            <Badge variant="warning" size="sm" className="text-xs">TOOL</Badge>
                          )}
                          {isImported && component.isMainTechnology !== false && (
                            <Badge variant="secondary" size="sm" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Community</Badge>
                          )}
                          <Badge 
                            variant={component.pricing === 'free' ? 'success' : component.pricing === 'freemium' ? 'warning' : 'danger'}
                            size="sm"
                            className="text-xs"
                          >
                            {component.pricing}
                          </Badge>
                        </div>

                        {/* Setup time simple */}
                        <div className="text-xs text-slate-400 flex items-center justify-between">
                          <span>{component.setupTimeHours}h setup</span>
                          {isImported && communityComp.rating && (
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-400">⭐</span>
                              <span className="text-slate-300">{communityComp.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        {/* Status indicator */}
                        {isUsed && (
                          <div className="absolute top-2 right-2">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs">✓</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                  ))
                )}
              </div>

              {/* Special Actions */}
              {onOpenCustomContainerModal && (
                <div className="mt-4 pt-3 border-t border-slate-700">
                  <button
                    onClick={onOpenCustomContainerModal}
                    className="w-full p-3 rounded-xl border-2 border-dashed border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-400/50 text-purple-300 hover:text-purple-200 transition-all duration-200 text-center"
                  >
                    <div className="w-8 h-8 rounded bg-purple-600/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-2">
                      <span className="text-lg">🛠️</span>
                    </div>
                    <div className="font-medium text-sm">
                      Créer un conteneur personnalisé
                    </div>
                    <div className="text-xs text-purple-400/70 mt-1">
                      Définir votre propre template
                    </div>
                  </button>
                </div>
              )}
            </div>

          </>
        )}
      </div>
    </div>
  );
};