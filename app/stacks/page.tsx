'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { getAllStacks, StackData } from '@/lib/data/stacksData';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Users,
  ArrowUpDown,
  Grid3X3,
  List,
  ArrowRight
} from 'lucide-react';

export default function StacksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get real data from our stack database
  const allStacks = getAllStacks();
  
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
        return b.stars - a.stars;
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'uses':
        return b.uses - a.uses;
      default: // popular
        return (b.stars * 0.7 + b.uses * 0.3) - (a.stars * 0.7 + a.uses * 0.3);
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

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-100">Explore Stacks</h1>
          <p className="mt-2 text-lg text-slate-400">
            Discover pre-built technology stacks created by the community
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1">
              <Input
                placeholder="Search stacks..."
                icon={<Search className="h-5 w-5" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <Select
                options={categories}
                value={selectedCategory}
                onChange={setSelectedCategory}
                className="w-48"
              />
              <Select
                options={difficulties}
                value={selectedDifficulty}
                onChange={setSelectedDifficulty}
                className="w-48"
              />
              <Select
                options={sortOptions}
                value={sortBy}
                onChange={setSortBy}
                className="w-48"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Showing {filteredStacks.length} of {allStacks.length} stacks
            </p>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Stacks Grid/List */}
        <div className={viewMode === 'grid' 
          ? 'grid gap-6 sm:grid-cols-2 lg:grid-cols-3' 
          : 'space-y-4'
        }>
          {filteredStacks.map((stack) => (
            <Link key={stack.id} href={`/stacks/${stack.id}`}>
              <Card 
                variant="glass" 
                className="group cursor-pointer hover:bg-slate-800/60 h-full"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="group-hover:text-blue-400 line-clamp-2">
                        {stack.name}
                      </CardTitle>
                      <p className="mt-1 text-sm text-slate-400 line-clamp-2">{stack.shortDescription}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {stack.technologies.slice(0, 3).map((tech) => (
                      <Badge key={tech.id} variant="primary" size="sm">
                        {tech.name}
                      </Badge>
                    ))}
                    {stack.technologies.length > 3 && (
                      <Badge variant="default" size="sm">
                        +{stack.technologies.length - 3} more
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-slate-400">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-current text-yellow-400" />
                        <span>{stack.stars}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{stack.uses}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{stack.setupTimeHours}h</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <Badge 
                      variant={getDifficultyColor(stack.difficulty) as any} 
                      size="sm"
                      outline
                    >
                      {stack.difficulty}
                    </Badge>
                    <span className="text-xs text-slate-500">by {stack.author}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-12 text-center">
          <Button variant="secondary">
            Load More Stacks
          </Button>
        </div>
      </div>
    </div>
  );
}