'use client';

import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { NodeData, SubTechnology } from './CanvasNode';
import { 
  Plus, 
  X,
  Grip,
  Users,
  Star,
  ExternalLink,
  Package
} from 'lucide-react';
import Link from 'next/link';

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

// Interface for community component from API
interface ApiCommunityComponent {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'component' | 'container';
  containerType?: 'docker' | 'kubernetes';
  setupTimeHours: number;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  pricing: 'free' | 'freemium' | 'paid';
  documentation?: string;
  officialDocsUrl?: string;
  githubUrl?: string;
  logoUrl?: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  reviewCount: number;
  likesCount: number;
  usageCount: number;
  isOfficial: boolean;
  compatibleWith?: string[];
  containedTechnologies?: string[];
  resourceRequirements?: {
    cpu?: string;
    memory?: string;
    storage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Convert community component to NodeData format
const convertCommunityToNodeData = (component: ApiCommunityComponent): CommunityNodeData => {
  // Map community component category to NodeData category
  const mapCategory = (category: string): NodeData['category'] => {
    switch (category) {
      case 'tool': return 'other';
      case 'infrastructure': return 'devops';
      default: return category as NodeData['category'];
    }
  };

  return {
    id: component.id,
    name: component.name,
    category: mapCategory(component.category),
    description: component.description,
    setupTimeHours: component.setupTimeHours,
    difficulty: component.difficulty as NodeData['difficulty'],
    pricing: component.pricing as NodeData['pricing'],
    isMainTechnology: component.type === 'component' || !['styling', 'testing', 'documentation', 'build-tools', 'linting'].includes(component.category),
    canAcceptSubTech: component.type === 'component' ? ['styling', 'testing', 'documentation'] : undefined,
    compatibleWith: component.compatibleWith || [],
    incompatibleWith: [],
    resources: component.resourceRequirements ? {
      cpu: component.resourceRequirements.cpu || '0.5 cores',
      memory: component.resourceRequirements.memory || '256MB',
      storage: component.resourceRequirements.storage || '50MB',
      network: '5Mbps'
    } : {
      cpu: '0.5 cores',
      memory: '256MB', 
      storage: '50MB',
      network: '5Mbps'
    },
    environmentVariables: {},
    // Documentation from community component
    documentation: component.documentation,
    // Container properties - corrected mapping
    isContainer: component.type === 'container',
    containerType: component.containerType,
    containedTechnologies: component.containedTechnologies || [],
    // Community-specific fields with NodeData compatibility
    isCommunity: true,
    logoUrl: component.logoUrl,
    githubUrl: component.githubUrl,
    npmUrl: undefined, // API doesn't have npm_url, only github_url
    officialDocsUrl: component.officialDocsUrl,
    tags: component.tags || [],
    rating: component.rating,
    usageCount: component.usageCount,
    author: component.author?.name || 'Community User'
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
  }, [showCommunity, communityComponents.length]);

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
      const response = await fetch('/api/community-components?limit=50');
      const data = await response.json();
      
      const convertedComponents = (data.components || []).map(convertCommunityToNodeData);
      
      setCommunityComponents(convertedComponents);
    } catch (error) {
      console.error('Failed to load community components:', error);
    } finally {
      setLoadingCommunity(false);
    }
  };


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


  const clearFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCategory || searchQuery;

  return (
    <div className={cn('flex flex-col h-full bg-slate-900/60 backdrop-blur-xl border-r border-slate-700/60', className)}>
      {/* Modern Header with glassmorphism */}
      <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Components
          </h2>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        </div>
        
        {/* Modern Tabs with glassmorphism */}
        <div className="flex bg-slate-800/40 rounded-xl p-1 backdrop-blur-sm border border-slate-700/30">
          <button
            onClick={() => setShowCommunity(false)}
            className={cn(
              "flex-1 px-4 py-2.5 text-sm font-medium transition-all duration-300 rounded-lg",
              !showCommunity 
                ? "bg-white/10 text-white shadow-lg backdrop-blur-sm border border-white/20" 
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            Available
          </button>
          <button
            onClick={() => setShowCommunity(true)}
            className={cn(
              "flex-1 px-4 py-2.5 text-sm font-medium transition-all duration-300 rounded-lg flex items-center justify-center gap-2",
              showCommunity 
                ? "bg-white/10 text-white shadow-lg backdrop-blur-sm border border-white/20" 
                : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            )}
          >
            <Users className="w-4 h-4" />
            Community
            <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse" title="New"></div>
          </button>
        </div>
        
        

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="mt-3 text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-xl transition-all duration-300"
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
                            'group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 border',
                            'bg-slate-900/60 backdrop-blur-md hover:bg-slate-800/80',
                            'border-slate-700/50 hover:border-slate-600/80',
                            'hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10',
                            isUsed && 'opacity-60 cursor-not-allowed hover:scale-100',
                            'border-l-4 border-l-blue-500/60' // Community indicator with glassmorphism
                          )}
                          onClick={() => {
                            if (!isUsed) {
                              // Save to imported components when used
                              saveImportedComponent(communityComp);
                              // Track usage
                              fetch('/api/community-components/usage', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ componentId: component.id })
                              }).catch(console.error);
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
                          {/* Header section with logo and type */}
                          <div className="flex items-start gap-3 mb-3">
                            <div className={cn(
                              'w-12 h-12 rounded-xl flex items-center justify-center text-lg font-semibold shadow-md',
                              component.isContainer 
                                ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white'
                                : 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white'
                            )}>
                              {component.isContainer ? '📦' : '🌐'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-white text-base truncate group-hover:text-blue-300 transition-colors">
                                  {component.name}
                                </h3>
                                {component.isContainer && (
                                  <Badge variant="warning" size="sm" className="ml-2 bg-orange-500/20 text-orange-300 border-orange-500/30">
                                    CONTAINER
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                                {component.description || 'No description available'}
                              </p>
                            </div>
                          </div>

                          {/* Stats and badges row */}
                          <div className="flex items-center gap-3 mb-3">
                            {communityComp.rating && (
                              <div className="flex items-center gap-1.5 bg-slate-800/50 rounded-lg px-2.5 py-1.5">
                                <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                                <span className="text-sm font-medium text-yellow-300">{communityComp.rating.toFixed(1)}</span>
                                <span className="text-xs text-slate-500">({communityComp.usageCount || 0})</span>
                              </div>
                            )}
                            
                            <Badge 
                              variant={component.pricing === 'free' ? 'success' : component.pricing === 'freemium' ? 'warning' : 'danger'}
                              size="sm"
                              className="font-medium"
                            >
                              {component.pricing}
                            </Badge>
                            
                            <div className="bg-slate-800/50 rounded-lg px-2.5 py-1.5">
                              <span className="text-xs text-slate-400">{component.setupTimeHours}h setup</span>
                            </div>
                          </div>

                          {/* Author and date */}
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-slate-500">
                              <Users className="w-3 h-3" />
                              <span>by {communityComp.author || 'Community'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isUsed ? (
                                <div className="flex items-center gap-1.5 bg-green-500/20 text-green-300 px-2 py-1 rounded-lg">
                                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                  <span className="text-xs font-medium">Added</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Grip className="h-3.5 w-3.5 text-slate-500" />
                                  <Plus className="h-3.5 w-3.5 text-slate-400" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Hover effect overlay */}
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
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
                  Object.entries(groupedComponents).map(([, components]) => (
                    components.map(component => {
                    const isUsed = usedComponentIds.includes(component.id);
                    const isImported = importedComponents.some(ic => ic.id === component.id);
                    const communityComp = component as CommunityNodeData;
                    
                    return (
                      <div
                        key={component.id}
                        className={cn(
                          'relative rounded-2xl p-4 transition-all duration-300 cursor-pointer group border',
                          'bg-slate-900/60 backdrop-blur-md hover:bg-slate-800/80',
                          'border-slate-700/50 hover:border-slate-600/80',
                          'hover:scale-[1.02] hover:shadow-xl',
                          isUsed 
                            ? 'opacity-60 cursor-not-allowed hover:scale-100' 
                            : 'hover:shadow-purple-500/10',
                          component.isMainTechnology === false && 'border-l-4 border-l-orange-500/60 hover:shadow-orange-500/10',
                          isImported && component.isMainTechnology !== false && 'border-l-4 border-l-blue-500/60 hover:shadow-blue-500/10'
                        )}
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
                        {/* Header section with modern layout */}
                        <div className="flex items-center justify-between mb-3">
                          <div className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-semibold shadow-md',
                            component.isMainTechnology === false ? 'bg-gradient-to-br from-orange-500 to-red-600' :
                            isImported ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
                            component.category === 'frontend' ? 'bg-gradient-to-br from-pink-500 to-rose-600' :
                            component.category === 'backend' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                            component.category === 'database' ? 'bg-gradient-to-br from-emerald-500 to-green-600' :
                            'bg-gradient-to-br from-purple-500 to-violet-600'
                          )}>
                            {component.isMainTechnology === false ? '🛠️' :
                             isImported ? '🌐' :
                             component.category === 'frontend' ? '🎨' :
                             component.category === 'backend' ? '⚙️' :
                             component.category === 'database' ? '💾' : '🚀'}
                          </div>
                          {isUsed && (
                            <div className="w-6 h-6 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center">
                              <span className="text-green-400 text-xs font-bold">✓</span>
                            </div>
                          )}
                        </div>

                        {/* Component name and description */}
                        <div className="mb-3">
                          <h3 className="font-semibold text-white text-base mb-1 group-hover:text-blue-300 transition-colors">
                            {component.name}
                          </h3>
                          <p className="text-sm text-slate-400 line-clamp-2">
                            {component.description || 'Component description'}
                          </p>
                        </div>

                        {/* Modern badges layout */}
                        <div className="flex items-center gap-2 mb-3">
                          {component.isMainTechnology === false && (
                            <Badge variant="warning" size="sm" className="bg-orange-500/20 text-orange-300 border-orange-500/30 font-medium">
                              TOOL
                            </Badge>
                          )}
                          {isImported && component.isMainTechnology !== false && (
                            <Badge variant="secondary" size="sm" className="bg-blue-500/20 text-blue-400 border-blue-500/30 font-medium">
                              Community
                            </Badge>
                          )}
                          <Badge 
                            variant={component.pricing === 'free' ? 'success' : component.pricing === 'freemium' ? 'warning' : 'danger'}
                            size="sm"
                            className="font-medium"
                          >
                            {component.pricing}
                          </Badge>
                        </div>

                        {/* Stats row */}
                        <div className="flex items-center justify-between">
                          <div className="bg-slate-800/50 rounded-lg px-2.5 py-1.5">
                            <span className="text-xs text-slate-400 font-medium">{component.setupTimeHours}h setup</span>
                          </div>
                          {isImported && communityComp.rating && (
                            <div className="flex items-center gap-1.5 bg-slate-800/50 rounded-lg px-2.5 py-1.5">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-yellow-300 font-medium">{communityComp.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        {/* Hover effect overlay */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
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