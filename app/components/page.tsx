'use client';

import { useState, useEffect } from 'react';
import { componentsApi, type CreateComponentData } from '@/lib/api/components';
import { likesApi } from '@/lib/api/likes';
import { debugApi } from '@/lib/api/debug';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { 
  Plus, 
  Search, 
  Star,
  ExternalLink,
  Code,
  Package,
  Layers,
  Zap,
  Clock,
  Users,
  User,
  TrendingUp,
  FileText,
  Edit,
  Trash,
  Eye,
  X,
  Grip
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
  likesCount: number;
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
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedPricing, setSelectedPricing] = useState<string>('all');
  const [showMyComponents, setShowMyComponents] = useState(false);
  const [likedComponents, setLikedComponents] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'likes' | 'usage' | 'recent'>('likes');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [viewingComponent, setViewingComponent] = useState<Component | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalComponents, setTotalComponents] = useState(0);
  const ITEMS_PER_PAGE = 10;
  
  const { user, isLoading: userLoading } = useUserStore();

  // Load components from Supabase
  useEffect(() => {
    const loadComponents = async () => {
      try {
        // Add pagination parameters to the API call
        const params = new URLSearchParams({
          page: page.toString(),
          limit: ITEMS_PER_PAGE.toString(),
          ...(searchQuery && { search: searchQuery }),
          ...(selectedCategory !== 'all' && { category: selectedCategory })
        });
        
        const response = await fetch(`/api/components?${params}`);
        if (!response.ok) throw new Error('Failed to fetch components');
        
        const { components: fetchedComponents, total } = await response.json();
        setTotalComponents(total);
        
        // Transform API response to match Component interface
        interface ComponentResponse {
          id: string;
          name: string;
          description: string;
          category: string;
          type: string;
          setupTimeHours: number;
          difficulty: string;
          pricing: string;
          documentation?: string;
          officialDocsUrl?: string;
          githubUrl?: string;
          npmUrl?: string;
          logoUrl?: string;
          tags: string[];
          authorId: string;
          likesCount: number;
          usageCount: number;
          isOfficial: boolean;
          compatibleWith: string[];
          createdAt: string;
          updatedAt: string;
        }
        
        const transformedComponents = fetchedComponents.map((comp: ComponentResponse) => ({
          id: comp.id,
          name: comp.name,
          description: comp.description,
          category: comp.category,
          type: comp.type,
          setupTimeHours: comp.setupTimeHours,
          difficulty: comp.difficulty,
          pricing: comp.pricing,
          documentation: comp.documentation,
          officialDocsUrl: comp.officialDocsUrl,
          githubUrl: comp.githubUrl,
          npmUrl: comp.npmUrl,
          logo: comp.logoUrl,
          tags: comp.tags,
          author: {
            id: comp.authorId,
            name: 'Author', // TODO: Fetch author name
            avatar: undefined
          },
          rating: 0, // Will be replaced by likes system
          reviewCount: 0,
          likesCount: comp.likesCount,
          usageCount: comp.usageCount,
          isOfficial: comp.isOfficial,
          compatibleWith: comp.compatibleWith,
          createdAt: new Date(comp.createdAt),
          updatedAt: new Date(comp.updatedAt)
        }));
        
        setComponents(transformedComponents);
      } catch (error) {
        console.error('Failed to load components:', error);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    loadComponents();
  }, [page, searchQuery, selectedCategory]); // Reload when page or filters change
  
  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory, selectedType, selectedDifficulty, selectedPricing, sortBy, showMyComponents]);

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

    // Difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(comp => comp.difficulty === selectedDifficulty);
    }

    // Pricing filter
    if (selectedPricing !== 'all') {
      filtered = filtered.filter(comp => comp.pricing === selectedPricing);
    }

    // My components filter
    if (showMyComponents && user) {
      filtered = filtered.filter(comp => comp.author.id === user.id);
    }

    // Sort
    switch (sortBy) {
      case 'likes':
        filtered.sort((a, b) => b.likesCount - a.likesCount);
        break;
      case 'usage':
        filtered.sort((a, b) => b.usageCount - a.usageCount);
        break;
      case 'recent':
        filtered.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        break;
    }

    setFilteredComponents(filtered);
  }, [selectedType, showMyComponents, sortBy, components, user]);

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

  // Handle component liking (like/unlike)
  const handleLikeComponent = async (componentId: string) => {
    if (!user) {
      alert('Please login to like components');
      return;
    }

    try {
      console.log('🔄 Toggling like for component:', componentId);
      
      // Use client-side API instead of API routes
      const { liked, likesCount } = await likesApi.toggleLike(componentId);
      
      console.log('✅ Like toggled successfully:', { liked, likesCount });
      
      // Update local liked components state
      const newLikedComponents = new Set(likedComponents);
      if (liked) {
        newLikedComponents.add(componentId);
      } else {
        newLikedComponents.delete(componentId);
      }
      setLikedComponents(newLikedComponents);
      
      // Update component likes count in local state with the real count from DB
      const updatedComponents = components.map(comp => {
        if (comp.id === componentId) {
          console.log(`📊 Updating component ${comp.name} likes: ${comp.likesCount} → ${likesCount}`);
          return {
            ...comp,
            likesCount: likesCount
          };
        }
        return comp;
      });
      setComponents(updatedComponents);
      
      console.log('🔄 Components state updated');
      
      // Debug: Check what's actually in the database
      setTimeout(() => {
        debugApi.checkComponentLikes(componentId);
        debugApi.checkUserLikes();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Failed to like/unlike component:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update like. Please try again.';
      alert(errorMessage);
    }
  };

  // Load user's liked components on mount
  useEffect(() => {
    if (user) {
      const loadLikedComponents = async () => {
        try {
          const likedComponentIds = await likesApi.getUserLikedComponents();
          setLikedComponents(new Set(likedComponentIds));
          
          // Debug: Also check what we found
          console.log('🎆 Loaded liked components on mount:', likedComponentIds);
          setTimeout(() => debugApi.checkUserLikes(), 500);
        } catch (error) {
          console.error('Failed to load liked components:', error);
        }
      };
      loadLikedComponents();
    } else {
      setLikedComponents(new Set());
    }
  }, [user]);

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
          <div className="space-y-4 mb-6">
            {/* Search and Quick Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
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
              
              {/* Quick Actions */}
              <div className="flex gap-3">
                {user && (
                  <Button
                    variant={showMyComponents ? "primary" : "secondary"}
                    onClick={() => setShowMyComponents(!showMyComponents)}
                    className="flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    My Components ({components.filter(c => c.author.id === user.id).length})
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedType('all');
                    setSelectedDifficulty('all');
                    setSelectedPricing('all');
                    setShowMyComponents(false);
                    setSearchQuery('');
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
            
            {/* Detailed Filters */}
            <div className="flex flex-wrap gap-4">
              <Select
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value)}
                className="w-40"
              >
                <option value="all">All Categories</option>
                {Object.keys(categoryConfig).map(cat => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </Select>
              
              <Select
                value={selectedType}
                onChange={(value) => setSelectedType(value)}
                className="w-40"
              >
                <option value="all">All Types</option>
                <option value="main">Main Components</option>
                <option value="sub">Sub Components</option>
              </Select>

              <Select
                value={selectedDifficulty}
                onChange={(value) => setSelectedDifficulty(value)}
                className="w-40"
              >
                <option value="all">All Difficulty</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </Select>

              <Select
                value={selectedPricing}
                onChange={(value) => setSelectedPricing(value)}
                className="w-40"
              >
                <option value="all">All Pricing</option>
                <option value="free">Free</option>
                <option value="freemium">Freemium</option>
                <option value="paid">Paid</option>
              </Select>
              
              <Select
                value={sortBy}
                onChange={(value) => setSortBy(value as 'likes' | 'usage' | 'recent')}
                className="w-40"
              >
                <option value="likes">Most Liked</option>
                <option value="usage">Most Used</option>
                <option value="recent">Recently Updated</option>
              </Select>
            </div>

            {/* Active Filters Display */}
            {(selectedCategory !== 'all' || selectedType !== 'all' || selectedDifficulty !== 'all' || selectedPricing !== 'all' || showMyComponents || searchQuery) && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-slate-400">Active filters:</span>
                {selectedCategory !== 'all' && (
                  <Badge variant="secondary" size="sm">
                    Category: {selectedCategory}
                  </Badge>
                )}
                {selectedType !== 'all' && (
                  <Badge variant="secondary" size="sm">
                    Type: {selectedType}
                  </Badge>
                )}
                {selectedDifficulty !== 'all' && (
                  <Badge variant="secondary" size="sm">
                    Difficulty: {selectedDifficulty}
                  </Badge>
                )}
                {selectedPricing !== 'all' && (
                  <Badge variant="secondary" size="sm">
                    Pricing: {selectedPricing}
                  </Badge>
                )}
                {showMyComponents && (
                  <Badge variant="primary" size="sm">
                    My Components
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary" size="sm">
                    Search: &quot;{searchQuery}&quot;
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Components Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredComponents.map((component) => {
            const CategoryIcon = categoryConfig[component.category].icon;
            const isOwner = user?.id === component.author.id;
            
            // Handle drag & drop for adding to visual builder
            const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
              e.dataTransfer.effectAllowed = 'copy';
              e.dataTransfer.setData('application/json', JSON.stringify({
                type: 'community-component',
                component: {
                  id: component.id,
                  name: component.name,
                  category: component.category,
                  description: component.description,
                  setupTimeHours: component.setupTimeHours,
                  difficulty: component.difficulty,
                  pricing: component.pricing,
                  documentation: component.documentation,
                  officialDocsUrl: component.officialDocsUrl,
                  githubUrl: component.githubUrl,
                  npmUrl: component.npmUrl,
                  tags: component.tags
                }
              }));
            };
            
            return (
              <Card 
                key={component.id} 
                variant="glass" 
                className="hover:border-slate-600 transition-all cursor-move relative group" 
                draggable
                onDragStart={handleDragStart}
              >
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
                          <Badge 
                            variant={component.pricing === 'free' ? 'success' : component.pricing === 'freemium' ? 'warning' : 'danger'}
                            size="sm"
                          >
                            {component.pricing}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 items-center">
                      {/* Drag handle always visible */}
                      <div className="opacity-60 group-hover:opacity-100 transition-opacity mr-2">
                        <Grip className="w-4 h-4 text-slate-400" />
                      </div>
                      
                      {isOwner && (
                        <>
                        <Badge variant="success" size="sm" className="mr-2">
                          Owner
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingComponent(component)}
                          className="p-1 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300"
                          title="Edit component"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComponent(component.id)}
                          className="p-1 hover:bg-red-500/20 text-red-400 hover:text-red-300"
                          title="Delete component"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-slate-300 mb-4 line-clamp-2">
                    {component.description}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {component.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" size="sm">
                        #{tag}
                      </Badge>
                    ))}
                    {component.tags.length > 3 && (
                      <Badge variant="secondary" size="sm">
                        +{component.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Links & Actions */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
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
                          onClick={() => setViewingComponent(component)}
                          className="text-green-400 hover:text-green-300 transition-colors"
                          title="Community Documentation"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    {/* View Details Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setViewingComponent(component)}
                      className="text-slate-400 hover:text-white text-xs px-2 py-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Details
                    </Button>
                  </div>
                  
                  {/* Stats & Actions */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-slate-400">
                        <Users className="w-4 h-4" />
                        <span>{component.usageCount.toLocaleString()} uses</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span>{component.setupTimeHours}h setup</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span>{component.likesCount} likes</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Like Button */}
                      {user && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLikeComponent(component.id)}
                          className={`p-1 ${
                            likedComponents.has(component.id)
                              ? 'text-yellow-400 hover:text-yellow-300'
                              : 'text-slate-400 hover:text-yellow-400'
                          }`}
                          title={likedComponents.has(component.id) ? 'Unlike' : 'Like this component'}
                        >
                          <Star 
                            className={`w-4 h-4 ${
                              likedComponents.has(component.id) ? 'fill-current' : ''
                            }`} 
                          />
                        </Button>
                      )}
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

        {/* Pagination */}
        {totalComponents > ITEMS_PER_PAGE && (
          <div className="flex justify-center items-center gap-4 mt-8 mb-6">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-2"
            >
              ← Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, Math.ceil(totalComponents / ITEMS_PER_PAGE)) }, (_, i) => {
                const totalPages = Math.ceil(totalComponents / ITEMS_PER_PAGE);
                let startPage = Math.max(1, page - 2);
                const endPage = Math.min(totalPages, startPage + 4);
                
                if (endPage - startPage < 4) {
                  startPage = Math.max(1, endPage - 4);
                }
                
                const pageNum = startPage + i;
                if (pageNum <= totalPages) {
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className={pageNum === page ? "px-3" : "px-3 text-slate-400 hover:text-white"}
                    >
                      {pageNum}
                    </Button>
                  );
                }
                return null;
              })}
              
              {Math.ceil(totalComponents / ITEMS_PER_PAGE) > 5 && page < Math.ceil(totalComponents / ITEMS_PER_PAGE) - 2 && (
                <>
                  <span className="text-slate-500 px-2">...</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(Math.ceil(totalComponents / ITEMS_PER_PAGE))}
                    className="px-3 text-slate-400 hover:text-white"
                  >
                    {Math.ceil(totalComponents / ITEMS_PER_PAGE)}
                  </Button>
                </>
              )}
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(p => Math.min(Math.ceil(totalComponents / ITEMS_PER_PAGE), p + 1))}
              disabled={page >= Math.ceil(totalComponents / ITEMS_PER_PAGE)}
              className="flex items-center gap-2"
            >
              Next →
            </Button>
            
            <div className="ml-4 text-sm text-slate-400">
              Showing {(page - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(page * ITEMS_PER_PAGE, totalComponents)} of {totalComponents} components
            </div>
          </div>
        )}

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

      {/* Component Detail Modal */}
      {viewingComponent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div className="relative bg-slate-900 rounded-xl border border-slate-700 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br from-${categoryConfig[viewingComponent.category].color}-500/20 to-${categoryConfig[viewingComponent.category].color}-600/20`}>
                    {(() => {
                      const CategoryIcon = categoryConfig[viewingComponent.category].icon;
                      return <CategoryIcon className="w-8 h-8 text-white" />;
                    })()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      {viewingComponent.name}
                      {viewingComponent.isOfficial && (
                        <Badge variant="primary">Official</Badge>
                      )}
                    </h2>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="secondary">
                        {viewingComponent.type === 'main' ? 'Main' : 'Sub'}
                      </Badge>
                      <Badge variant={viewingComponent.difficulty === 'beginner' ? 'success' : viewingComponent.difficulty === 'intermediate' ? 'warning' : 'danger'}>
                        {viewingComponent.difficulty}
                      </Badge>
                      <Badge variant={viewingComponent.pricing === 'free' ? 'success' : viewingComponent.pricing === 'freemium' ? 'warning' : 'danger'}>
                        {viewingComponent.pricing}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setViewingComponent(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                <p className="text-slate-300 leading-relaxed">{viewingComponent.description}</p>
              </div>

              {/* Tags */}
              {viewingComponent.tags && viewingComponent.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {viewingComponent.tags.map(tag => (
                      <Badge key={tag} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Documentation */}
              {viewingComponent.documentation && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Documentation</h3>
                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono">
                      {viewingComponent.documentation}
                    </pre>
                  </div>
                </div>
              )}

              {/* Links */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Links</h3>
                <div className="flex flex-wrap gap-4">
                  {viewingComponent.officialDocsUrl && (
                    <a
                      href={viewingComponent.officialDocsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      Official Documentation
                    </a>
                  )}
                  {viewingComponent.githubUrl && (
                    <a
                      href={viewingComponent.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      GitHub Repository
                    </a>
                  )}
                  {viewingComponent.npmUrl && (
                    <a
                      href={viewingComponent.npmUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      NPM Package
                    </a>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 rounded-lg p-4 text-center">
                  <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-white">{viewingComponent.rating.toFixed(1)}</div>
                  <div className="text-sm text-slate-400">Rating</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 text-center">
                  <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-white">{viewingComponent.likesCount}</div>
                  <div className="text-sm text-slate-400">Likes</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 text-center">
                  <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-white">{viewingComponent.usageCount.toLocaleString()}</div>
                  <div className="text-sm text-slate-400">Uses</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 text-center">
                  <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-lg font-semibold text-white">{viewingComponent.setupTimeHours}h</div>
                  <div className="text-sm text-slate-400">Setup Time</div>
                </div>
              </div>

              {/* Author & Date */}
              <div className="bg-slate-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Author Information</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {viewingComponent.author.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-white">{viewingComponent.author.name}</div>
                      <div className="text-sm text-slate-400">Component Author</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-300">
                      Created: {new Date(viewingComponent.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-slate-400">
                      Updated: {new Date(viewingComponent.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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