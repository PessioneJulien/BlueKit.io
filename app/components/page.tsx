'use client';

import { useState, useEffect } from 'react';
import { componentsApi, type Component as ApiComponent, type CreateComponentData } from '@/lib/api/components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { 
  Plus, 
  Search, 
  Filter,
  Star,
  ExternalLink,
  Code,
  Package,
  Layers,
  Zap,
  Clock,
  Users,
  TrendingUp,
  FileText,
  Edit,
  Trash,
  Eye
} from 'lucide-react';
import Link from 'next/link';
import { ComponentModal } from '@/components/ui/ComponentModal';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useUserStore } from '@/lib/stores/userStore';

// Types
interface Component {
  id: string;
  name: string;
  description: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'mobile' | 'ai' | 'tool' | 'other';
  type: 'main' | 'sub';
  setupTimeHours: number;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  pricing: 'free' | 'freemium' | 'paid';
  documentation?: string;
  officialDocsUrl?: string;
  githubUrl?: string;
  npmUrl?: string;
  logo?: string;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  reviewCount: number;
  usageCount: number;
  isOfficial: boolean;
  compatibleWith?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Remove mock data - will load from Supabase

// Category config
const categoryConfig = {
  frontend: { color: 'blue', icon: Layers },
  backend: { color: 'green', icon: Code },
  database: { color: 'purple', icon: Package },
  devops: { color: 'orange', icon: Zap },
  mobile: { color: 'pink', icon: Package },
  ai: { color: 'yellow', icon: Zap },
  tool: { color: 'cyan', icon: Package },
  other: { color: 'gray', icon: Package }
};

export default function ComponentsPage() {
  const [components, setComponents] = useState<Component[]>([]);
  const [filteredComponents, setFilteredComponents] = useState<Component[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'usage' | 'recent'>('rating');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { user, isLoading: userLoading } = useUserStore();

  // Load components from Supabase
  useEffect(() => {
    const loadComponents = async () => {
      try {
        const fetchedComponents = await componentsApi.getComponents({
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          type: selectedType !== 'all' ? selectedType : undefined,
          search: searchQuery || undefined,
          sortBy
        });
        setComponents(fetchedComponents);
      } catch (error) {
        console.error('Failed to load components:', error);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    loadComponents();
  }, [searchQuery, selectedCategory, selectedType, sortBy]);

  // Filter components for display (local filtering for immediate feedback)
  useEffect(() => {
    let filtered = [...components];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(comp => 
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(comp => comp.category === selectedCategory);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(comp => comp.type === selectedType);
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'usage':
        filtered.sort((a, b) => b.usageCount - a.usageCount);
        break;
      case 'recent':
        filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        break;
    }

    setFilteredComponents(filtered);
  }, [searchQuery, selectedCategory, selectedType, sortBy, components]);

  const handleCreateComponent = async (componentData: Partial<Component>) => {
    try {
      setLoading(true);
      const createData: CreateComponentData = {
        name: componentData.name!,
        description: componentData.description!,
        category: componentData.category!,
        type: componentData.type!,
        setupTimeHours: componentData.setupTimeHours!,
        difficulty: componentData.difficulty!,
        pricing: componentData.pricing!,
        documentation: componentData.documentation,
        officialDocsUrl: componentData.officialDocsUrl,
        githubUrl: componentData.githubUrl,
        npmUrl: componentData.npmUrl,
        tags: componentData.tags || [],
        compatibleWith: componentData.compatibleWith || []
      };

      const newComponent = await componentsApi.createComponent(createData);
      setComponents([newComponent, ...components]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create component:', error);
      alert('Failed to create component. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditComponent = async (componentData: Partial<Component>) => {
    if (!editingComponent) return;

    try {
      setLoading(true);
      const updateData: Partial<CreateComponentData> = {
        name: componentData.name,
        description: componentData.description,
        category: componentData.category,
        type: componentData.type,
        setupTimeHours: componentData.setupTimeHours,
        difficulty: componentData.difficulty,
        pricing: componentData.pricing,
        documentation: componentData.documentation,
        officialDocsUrl: componentData.officialDocsUrl,
        githubUrl: componentData.githubUrl,
        npmUrl: componentData.npmUrl,
        tags: componentData.tags,
        compatibleWith: componentData.compatibleWith
      };

      const updatedComponent = await componentsApi.updateComponent(editingComponent.id, updateData);
      const updatedComponents = components.map(comp => 
        comp.id === editingComponent.id ? updatedComponent : comp
      );
      setComponents(updatedComponents);
      setEditingComponent(null);
    } catch (error) {
      console.error('Failed to update component:', error);
      alert('Failed to update component. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComponent = async (componentId: string) => {
    if (confirm('Are you sure you want to delete this component?')) {
      try {
        setLoading(true);
        await componentsApi.deleteComponent(componentId);
        setComponents(components.filter(comp => comp.id !== componentId));
      } catch (error) {
        console.error('Failed to delete component:', error);
        alert('Failed to delete component. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading || userLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Community Components
              </h1>
              <p className="text-slate-400">
                Discover and share reusable components for your tech stack
              </p>
            </div>
            
            {user && (
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Component
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card variant="glass">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Package className="w-8 h-8 text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">{components.length}</p>
                    <p className="text-sm text-slate-400">Total Components</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card variant="glass">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {components.reduce((sum, c) => sum + c.usageCount, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-400">Total Uses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card variant="glass">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 text-yellow-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {components.length > 0 
                        ? (components.reduce((sum, c) => sum + c.rating, 0) / components.length).toFixed(1)
                        : '0.0'
                      }
                    </p>
                    <p className="text-sm text-slate-400">Average Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card variant="glass">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-purple-400" />
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {components.filter(c => c.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                    </p>
                    <p className="text-sm text-slate-400">New This Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search components..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-40"
              >
                <option value="all">All Categories</option>
                {Object.keys(categoryConfig).map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </Select>
              
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-40"
              >
                <option value="all">All Types</option>
                <option value="main">Main Components</option>
                <option value="sub">Sub Components</option>
              </Select>
              
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-40"
              >
                <option value="rating">Top Rated</option>
                <option value="usage">Most Used</option>
                <option value="recent">Recently Updated</option>
              </Select>
            </div>
          </div>
        </div>

        {/* Components Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComponents.map((component) => {
            const CategoryIcon = categoryConfig[component.category].icon;
            const isOwner = user?.id === component.author.id;
            
            return (
              <Card key={component.id} variant="glass" className="hover:border-slate-600 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br from-${categoryConfig[component.category].color}-500/20 to-${categoryConfig[component.category].color}-600/20`}>
                        <CategoryIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {component.name}
                          {component.isOfficial && (
                            <Badge variant="primary" size="sm">Official</Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" size="sm">
                            {component.type === 'main' ? 'Main' : 'Sub'}
                          </Badge>
                          <Badge 
                            variant={component.difficulty === 'beginner' ? 'success' : component.difficulty === 'intermediate' ? 'warning' : 'danger'}
                            size="sm"
                          >
                            {component.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {isOwner && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingComponent(component)}
                          className="p-1"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComponent(component.id)}
                          className="p-1 text-red-400 hover:text-red-300"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-slate-300 mb-4 line-clamp-2">
                    {component.description}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {component.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" size="sm">
                        #{tag}
                      </Badge>
                    ))}
                    {component.tags.length > 3 && (
                      <Badge variant="outline" size="sm">
                        +{component.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Links */}
                  <div className="flex gap-2 mb-4">
                    {component.officialDocsUrl && (
                      <a
                        href={component.officialDocsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Official Documentation"
                      >
                        <FileText className="w-4 h-4" />
                      </a>
                    )}
                    {component.githubUrl && (
                      <a
                        href={component.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-white transition-colors"
                        title="GitHub"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    {component.documentation && (
                      <button
                        className="text-green-400 hover:text-green-300 transition-colors"
                        title="Community Documentation"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-white font-medium">{component.rating.toFixed(1)}</span>
                        <span className="text-slate-400">({component.reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Users className="w-4 h-4" />
                        <span>{component.usageCount.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>{component.setupTimeHours}h</span>
                    </div>
                  </div>
                  
                  {/* Author */}
                  <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      by {component.author.name}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(component.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredComponents.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            {components.length === 0 ? (
              <>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">Welcome to Community Components!</h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  Be the first to share a component with the community. Create documentation, 
                  add useful links, and help others discover great tools.
                </p>
                {user && (
                  <Button
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Create First Component
                  </Button>
                )}
                {!user && (
                  <div className="text-sm text-slate-500">
                    <Link href="/auth/login" className="text-blue-400 hover:text-blue-300">
                      Login
                    </Link>{' '}
                    to create and share components
                  </div>
                )}
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">No components found</h3>
                <p className="text-slate-400">Try adjusting your filters or search query</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingComponent) && (
        <ComponentModal
          isOpen={true}
          onClose={() => {
            setShowCreateModal(false);
            setEditingComponent(null);
          }}
          onSave={editingComponent ? handleEditComponent : handleCreateComponent}
          component={editingComponent}
          existingComponents={components}
        />
      )}
    </div>
  );
}