'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { 
  Plus, 
  Search, 
  Star,
  Package,
  Layers,
  Server,
  Database,
  Smartphone,
  Brain,
  Wrench,
  Clock,
  Users,
  GitBranch,
  ChevronRight,
  Box,
  Container,
  SlidersHorizontal,
  X,
  Check,
  DollarSign,
  Gauge,
  Sparkles
} from 'lucide-react';
import { useUserStore } from '@/lib/stores/userStore';
import { ComponentSubmissionModal } from '@/components/ui/ComponentSubmissionModal';
import { ComponentDetailModal } from '@/components/ui/ComponentDetailModal';
import { useLike } from '@/lib/hooks/useLike';
// Types locaux (pas besoin d'importer depuis le builder)

// Types pour les composants communautaires
interface CommunityComponent {
  id: string;
  name: string;
  description: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'mobile' | 'ai' | 'infrastructure' | 'other';
  type: 'component' | 'container';
  containerType?: 'docker' | 'kubernetes';
  setupTimeHours: number;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  pricing: 'free' | 'freemium' | 'paid';
  documentation?: string;
  officialDocsUrl?: string;
  githubUrl?: string;
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
  containedTechnologies?: string[]; // Pour les containers
  resourceRequirements?: {
    cpu?: string;
    memory?: string;
    storage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Configuration des catégories avec icônes modernes
const categoryConfig = {
  frontend: { 
    label: 'Frontend', 
    icon: Layers, 
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20'
  },
  backend: { 
    label: 'Backend', 
    icon: Server, 
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20'
  },
  database: { 
    label: 'Database', 
    icon: Database, 
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20'
  },
  devops: { 
    label: 'DevOps', 
    icon: GitBranch, 
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20'
  },
  mobile: { 
    label: 'Mobile', 
    icon: Smartphone, 
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20'
  },
  ai: { 
    label: 'AI/ML', 
    icon: Brain, 
    color: 'from-yellow-500 to-yellow-600',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20'
  },
  infrastructure: { 
    label: 'Infrastructure', 
    icon: Box, 
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20'
  },
  other: { 
    label: 'Autre', 
    icon: Wrench, 
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20'
  }
};

export default function ComponentsPage() {
  // États
  const [components, setComponents] = useState<CommunityComponent[]>([]);
  const [filteredComponents, setFilteredComponents] = useState<CommunityComponent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'component' | 'container'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedPricing, setSelectedPricing] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating'>('popular');
  const [showFilters, setShowFilters] = useState(false);
  // Modals
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<CommunityComponent | null>(null);
  const [loading, setLoading] = useState(true);

  // Pas de mock data - chargé via l'API

  // Charger les composants
  useEffect(() => {
    loadComponents();
  }, []);

  const loadComponents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        category: selectedCategory,
        type: selectedType,
        difficulty: selectedDifficulty,
        pricing: selectedPricing,
        sortBy: sortBy,
        ...(searchQuery && { search: searchQuery })
      });
      
      const response = await fetch(`/api/community-components?${params}`);
      const data = await response.json();
      
      console.log('Components loaded:', data.components?.length || 0);
      setComponents(data.components || []);
      setFilteredComponents(data.components || []);
    } catch (error) {
      console.error('Erreur lors du chargement des composants:', error);
      setComponents([]);
      setFilteredComponents([]);
    } finally {
      setLoading(false);
    }
  };

  // Recharger quand les filtres changent
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadComponents();
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, selectedCategory, selectedType, selectedDifficulty, selectedPricing, sortBy]);


  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Community Components
            </h1>
            <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
              Découvrez et partagez des composants réutilisables pour vos stacks technologiques.
              Containers, services, et outils validés par la communauté.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                <div className="text-3xl font-bold text-white">{components.length}</div>
                <div className="text-sm text-gray-400">Composants</div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                <div className="text-3xl font-bold text-white">
                  {components.filter(c => c.type === 'container').length}
                </div>
                <div className="text-sm text-gray-400">Containers</div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                <div className="text-3xl font-bold text-white">
                  {components.filter(c => c.isOfficial).length}
                </div>
                <div className="text-sm text-gray-400">Officiels</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setShowSubmissionModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-5 h-5 mr-2" />
                Proposer un Composant
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-slate-800 hover:bg-slate-700"
              >
                <SlidersHorizontal className="w-5 h-5 mr-2" />
                Filtres
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Rechercher des composants, containers, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2">
              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as 'all' | 'component' | 'container')}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                <option value="all">Tous types</option>
                <option value="component">Composants</option>
                <option value="container">Containers</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'popular' | 'recent' | 'rating')}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
              >
                <option value="popular">Plus populaires</option>
                <option value="recent">Plus récents</option>
                <option value="rating">Mieux notés</option>
              </select>
            </div>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Category */}
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Catégorie</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="all">Toutes</option>
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Difficulté</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="all">Toutes</option>
                    <option value="beginner">Débutant</option>
                    <option value="intermediate">Intermédiaire</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                {/* Pricing */}
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Prix</label>
                  <select
                    value={selectedPricing}
                    onChange={(e) => setSelectedPricing(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="all">Tous</option>
                    <option value="free">Gratuit</option>
                    <option value="freemium">Freemium</option>
                    <option value="paid">Payant</option>
                  </select>
                </div>

                {/* Reset */}
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedType('all');
                      setSelectedDifficulty('all');
                      setSelectedPricing('all');
                      setSearchQuery('');
                    }}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Réinitialiser
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Components Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredComponents.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {components.length === 0 ? 'Aucun composant disponible' : 'Aucun composant trouvé'}
            </h3>
            <p className="text-gray-500 mb-4">
              {components.length === 0 
                ? 'La base de données est vide. Vous pouvez ajouter des composants ou initialiser avec des données de démonstration.'
                : 'Essayez de modifier vos critères de recherche'
              }
            </p>
            {components.length === 0 && (
              <Button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/community-components/seed', { method: 'POST' });
                    const result = await response.json();
                    console.log('Seed result:', result);
                    if (response.ok) {
                      await loadComponents();
                    }
                  } catch (error) {
                    console.error('Failed to seed data:', error);
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Ajouter des composants de démo
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComponents.map((component) => (
              <ComponentCard
                key={component.id}
                component={component}
                onClick={() => setSelectedComponent(component)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showSubmissionModal && (
        <ComponentSubmissionModal
          onClose={() => setShowSubmissionModal(false)}
          onSubmit={async (data) => {
            console.log('Submitting component:', data);
            try {
              const response = await fetch('/api/community-components', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
              });
              
              if (response.ok) {
                setShowSubmissionModal(false);
                await loadComponents();
                // TODO: Afficher notification de succès
              } else {
                const error = await response.json();
                console.error('Erreur lors de la soumission:', error);
                // TODO: Afficher notification d'erreur
              }
            } catch (error) {
              console.error('Erreur réseau:', error);
              // TODO: Afficher notification d'erreur
            }
          }}
        />
      )}

      {selectedComponent && (
        <ComponentDetailModal
          component={selectedComponent}
          onClose={() => setSelectedComponent(null)}
        />
      )}
    </div>
  );
}

// Composant Card moderne
function ComponentCard({ 
  component, 
  onClick 
}: { 
  component: CommunityComponent;
  onClick: () => void;
}) {
  const config = categoryConfig[component.category];
  const Icon = config.icon;
  const { user } = useUserStore();
  const { liked, likesCount, toggleLike, loading } = useLike(component.id, component.likesCount);

  return (
    <Card 
      className="group relative bg-slate-900/50 backdrop-blur-sm border-slate-800 hover:border-slate-700 transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
      
      <CardContent className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg group-hover:text-blue-400 transition-colors">
                {component.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="text-xs border border-slate-600 bg-transparent">
                  {component.type === 'container' ? (
                    <>
                      <Container className="w-3 h-3 mr-1" />
                      Container
                    </>
                  ) : (
                    <>
                      <Package className="w-3 h-3 mr-1" />
                      Component
                    </>
                  )}
                </Badge>
                {component.isOfficial && (
                  <Badge className="bg-green-600/20 text-green-400 border-green-600/30 text-xs">
                    <Check className="w-3 h-3 mr-1" />
                    Officiel
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          {/* Like button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!user) {
                // TODO: Afficher modal de connexion
                alert('Vous devez être connecté pour liker un composant');
                return;
              }
              toggleLike();
            }}
            disabled={loading}
            className={`p-2 rounded-lg transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800'
            }`}
            title={user ? (liked ? 'Retirer le like' : 'Ajouter un like') : 'Connectez-vous pour liker'}
          >
            <Star 
              className={`w-5 h-5 transition-colors ${
                liked ? 'fill-yellow-500 text-yellow-500' : 'text-gray-500 hover:text-yellow-400'
              } ${loading ? 'animate-pulse' : ''}`}
            />
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {component.description}
        </p>

        {/* Metadata */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Gauge className="w-3 h-3" />
            <span className={getDifficultyColor(component.difficulty)}>
              {component.difficulty === 'beginner' ? 'Débutant' : 
               component.difficulty === 'intermediate' ? 'Intermédiaire' : 'Expert'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{component.setupTimeHours}h setup</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <DollarSign className="w-3 h-3" />
            <span className={getPricingColor(component.pricing)}>
              {component.pricing === 'free' ? 'Gratuit' : 
               component.pricing === 'freemium' ? 'Freemium' : 'Payant'}
            </span>
          </div>
        </div>

        {/* Container Technologies */}
        {component.type === 'container' && component.containedTechnologies && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">Contient:</div>
            <div className="flex flex-wrap gap-1">
              {component.containedTechnologies.map((tech) => (
                <Badge 
                  key={tech} 
                  className="text-xs border border-slate-700 bg-transparent"
                >
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="w-3 h-3 text-yellow-500" />
              <span>{component.rating}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="w-3 h-3 text-yellow-500" />
              <span>{likesCount}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="w-3 h-3" />
              <span>{formatNumber(component.usageCount)}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
}

// Utility functions
function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'beginner':
      return 'text-green-400';
    case 'intermediate':
      return 'text-yellow-400';
    case 'expert':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}

function getPricingColor(pricing: string) {
  switch (pricing) {
    case 'free':
      return 'text-green-400';
    case 'freemium':
      return 'text-yellow-400';
    case 'paid':
      return 'text-orange-400';
    default:
      return 'text-gray-400';
  }
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}