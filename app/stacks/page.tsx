'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { getStacks, StackWithDetails } from '@/lib/supabase/stacks';
import { 
  Search, 
  Clock, 
  Users,
  Grid3X3,
  List,
  ArrowRight,
  Filter,
  TrendingUp,
  Sparkles,
  Code2,
  Zap,
  Award
} from 'lucide-react';
import { StarRating } from '@/components/ui/StarRating';
import { RatingModal } from '@/components/ui/RatingModal';
import { useUserStore } from '@/lib/stores/userStore';

export default function StacksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [allStacks, setAllStacks] = useState<StackWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedStackForRating, setSelectedStackForRating] = useState<StackWithDetails | null>(null);
  
  const { user } = useUserStore();

  // Load stacks from database
  useEffect(() => {
    async function loadStacks() {
      const stacksData = await getStacks();
      setAllStacks(stacksData);
      setLoading(false);
    }
    loadStacks();
  }, []);

  const handleOpenRatingModal = (stack: StackWithDetails) => {
    setSelectedStackForRating(stack);
    setRatingModalOpen(true);
  };
  
  // Filter and sort stacks
  const filteredStacks = allStacks.filter(stack => {
    const matchesSearch = stack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         stack.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         stack.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || stack.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesDifficulty = !selectedDifficulty || stack.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'stars':
        return b.rating - a.rating;
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'uses':
        return b.usage_count - a.usage_count;
      default: // popular
        return (b.rating * 0.7 + b.usage_count * 0.001) - (a.rating * 0.7 + a.usage_count * 0.001);
    }
  });

  // Get unique categories from stacks
  const categories = [
    { value: '', label: 'All Categories' },
    ...Array.from(new Set(allStacks.map(stack => stack.category)))
      .map(category => ({ value: category, label: category }))
  ];

  const difficulties = [
    { value: '', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'expert', label: 'Expert' },
  ];

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'stars', label: 'Most Stars' },
    { value: 'recent', label: 'Recently Added' },
    { value: 'uses', label: 'Most Used' },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'expert': return 'danger';
      default: return 'default';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '🌱';
      case 'intermediate': return '⚡';
      case 'expert': return '🚀';
      default: return '🔧';
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      'Full-stack': '🎯',
      'AI/ML': '🤖',
      'Rapid Development': '⚡',
      'E-commerce': '🛒',
      'Mobile': '📱',
      'Real-time': '🔄',
      'Content': '📝',
      'Enterprise': '🏢',
      'Microservices': '🔗',
      'Data Science': '📊',
      'API': '🔌',
      'Serverless': '☁️',
      'Desktop': '💻',
      'IoT': '🌐',
      'Blockchain': '⛓️'
    };
    return iconMap[category] || '🔧';
  };

  return (
    <div className="min-h-screen bg-slate-950 relative">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle, rgba(59, 130, 246, 0.05) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Hero Header */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 text-blue-400 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              {allStacks.length} Production-Ready Stacks
            </div>
            
            <h1 className="text-5xl font-bold text-white mb-4">
              Explore Technology 
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Stack Library
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Discover battle-tested technology stacks for every use case. 
              From MVP to enterprise, find the perfect foundation for your next project.
            </p>
            
            {/* Quick Stats */}
            {!loading && (
              <div className="flex items-center justify-center gap-8 mt-8 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <Code2 className="h-4 w-4 text-blue-400" />
                <span>{allStacks.length > 0 ? Math.round(allStacks.reduce((acc, stack) => acc + stack.setup_time_hours, 0) / allStacks.length) : 0}h avg setup</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span>{allStacks.reduce((acc, stack) => acc + stack.usage_count, 0).toLocaleString()} total uses</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Award className="h-4 w-4 text-yellow-400" />
                <span>{allStacks.length > 0 ? (allStacks.reduce((acc, stack) => acc + stack.rating, 0) / allStacks.length).toFixed(1) : '0'}/5 avg rating</span>
              </div>
            </div>
            )}
          </motion.div>

          {/* Enhanced Search & Filters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-12"
          >
            {/* Main Search */}
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur" />
              <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <div className="flex-1">
                    <Input
                      placeholder="Search stacks by name, technology, or use case..."
                      icon={<Search className="h-5 w-5" />}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-800/50 border-slate-700 text-lg h-14"
                    />
                  </div>
                  <Button
                    variant={filterOpen ? 'primary' : 'secondary'}
                    size="lg"
                    onClick={() => setFilterOpen(!filterOpen)}
                    className="lg:w-auto w-full"
                  >
                    <Filter className="h-5 w-5 mr-2" />
                    Filters
                  </Button>
                </div>
                
                {/* Expandable Filters */}
                <AnimatePresence>
                  {filterOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 overflow-hidden"
                    >
                      <div className="grid gap-4 md:grid-cols-3 pt-6 border-t border-slate-800">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                          <Select
                            options={categories}
                            value={selectedCategory}
                            onChange={setSelectedCategory}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Difficulty</label>
                          <Select
                            options={difficulties}
                            value={selectedDifficulty}
                            onChange={setSelectedDifficulty}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Sort by</label>
                          <Select
                            options={sortOptions}
                            value={sortBy}
                            onChange={setSortBy}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-slate-300 font-medium">
                  {filteredStacks.length} {filteredStacks.length === 1 ? 'stack' : 'stacks'} found
                </p>
                <p className="text-sm text-slate-500">
                  {searchQuery && `for "${searchQuery}"`}
                  {selectedCategory && ` in ${selectedCategory}`}
                  {selectedDifficulty && ` • ${selectedDifficulty} level`}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-3"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-3"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Stacks Display */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={`${viewMode}-${searchQuery}-${selectedCategory}-${selectedDifficulty}-${sortBy}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className={viewMode === 'grid' 
                ? 'grid gap-8 sm:grid-cols-2 lg:grid-cols-3' 
                : 'space-y-6'
              }
            >
              {filteredStacks.map((stack, index) => (
                <motion.div
                  key={stack.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  onHoverStart={() => setHoveredCard(stack.id)}
                  onHoverEnd={() => setHoveredCard(null)}
                  className="group"
                >
                  <Link href={`/stacks/${stack.slug}`}>
                    <div className="relative">
                      {/* Glow Effect */}
                      <div className="absolute -inset-px bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur" />
                      
                      <Card 
                        variant="glass" 
                        className="relative cursor-pointer hover:bg-slate-800/60 h-full border-slate-800 hover:border-slate-700 transition-all duration-300 rounded-2xl overflow-hidden"
                      >
                        {/* Header with Category Icon */}
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center text-2xl border border-blue-500/20">
                                {getCategoryIcon(stack.category)}
                              </div>
                              <div>
                                <Badge variant="secondary" size="sm" className="mb-2 bg-blue-500/10 text-blue-300">
                                  {stack.category}
                                </Badge>
                              </div>
                            </div>
                            <ArrowRight className={`h-5 w-5 text-slate-400 transition-all duration-300 ${
                              hoveredCard === stack.id ? 'translate-x-1 text-blue-400' : ''
                            }`} />
                          </div>
                          
                          <CardTitle className="group-hover:text-blue-400 transition-colors line-clamp-2 text-xl">
                            {stack.name}
                          </CardTitle>
                          <p className="text-slate-400 line-clamp-2 leading-relaxed">
                            {stack.short_description}
                          </p>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          {/* Tech Stack Preview */}
                          <div className="mb-6">
                            <div className="flex flex-wrap gap-2 mb-3">
                              {stack.technologies.slice(0, 4).map((tech) => (
                                <Badge 
                                  key={tech.id} 
                                  variant="primary" 
                                  size="sm"
                                  className="bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-700/50 transition-colors"
                                >
                                  {tech.technology_name}
                                </Badge>
                              ))}
                              {stack.technologies.length > 4 && (
                                <Badge 
                                  variant="default" 
                                  size="sm"
                                  className="bg-slate-700/30 text-slate-400"
                                >
                                  +{stack.technologies.length - 4}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* Stats Row */}
                          <div className="flex items-center justify-between text-sm mb-4">
                            <div className="flex items-center gap-4 text-slate-400">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleOpenRatingModal(stack);
                                }}
                                className="hover:scale-105 transition-transform"
                                title="Noter cette stack"
                              >
                                <StarRating 
                                  rating={stack.rating} 
                                  size="sm" 
                                  readonly={true} 
                                  showValue={true} 
                                  className="text-slate-300 hover:text-white transition-colors"
                                />
                              </button>
                              <div className="flex items-center gap-1.5">
                                <Users className="h-4 w-4 text-slate-500" />
                                <span>{stack.usage_count.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4 text-slate-500" />
                                <span>{stack.setup_time_hours}h</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Bottom Row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getDifficultyIcon(stack.difficulty)}</span>
                              <Badge 
                                variant={getDifficultyColor(stack.difficulty)} 
                                size="sm"
                                className="font-medium"
                              >
                                {stack.difficulty}
                              </Badge>
                            </div>
                            <span className="text-xs text-slate-500 font-medium">
                              by {stack.author}
                            </span>
                          </div>
                          
                          {/* Hover Effect - Use Cases */}
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ 
                              opacity: hoveredCard === stack.id ? 1 : 0,
                              height: hoveredCard === stack.id ? 'auto' : 0
                            }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 pt-4 border-t border-slate-800 overflow-hidden"
                          >
                            <p className="text-xs text-slate-500 mb-2 font-medium">Perfect for:</p>
                            <div className="flex flex-wrap gap-1">
                              {stack.use_cases.slice(0, 3).map((useCase, idx) => (
                                <span key={idx} className="text-xs bg-slate-800/50 text-slate-400 px-2 py-1 rounded">
                                  {useCase}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        </CardContent>
                      </Card>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
          
          {/* Empty State */}
          {filteredStacks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="h-12 w-12 text-slate-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No stacks found</h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                We couldn&apos;t find any stacks matching your criteria. Try adjusting your filters or search terms.
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                  setSelectedDifficulty('');
                  setSortBy('popular');
                }}
              >
                Clear All Filters
              </Button>
            </motion.div>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-slate-400">Loading stacks...</div>
            </div>
          ) : (
            <>
              {/* Enhanced Footer */}
              {filteredStacks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-16 text-center"
            >
              <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Can&apos;t find the perfect stack?
                </h3>
                <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
                  Create your own custom stack using our visual builder, or contribute a new one to help the community.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/builder">
                    <Button variant="primary" size="lg" className="min-w-48">
                      <Zap className="mr-2 h-5 w-5" />
                      Build Custom Stack
                    </Button>
                  </Link>
                  <Button variant="secondary" size="lg" className="min-w-48">
                    Suggest New Stack
                  </Button>
                </div>
              </div>
            </motion.div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {selectedStackForRating && (
        <RatingModal
          isOpen={ratingModalOpen}
          onClose={() => {
            setRatingModalOpen(false);
            setSelectedStackForRating(null);
          }}
          stackId={selectedStackForRating.id}
          stackName={selectedStackForRating.name}
          currentUser={user}
        />
      )}
    </div>
  );
}