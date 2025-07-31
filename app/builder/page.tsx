'use client';

import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { TechnologyCard, DraggableTechnologyCard, Technology } from '@/components/ui/TechnologyCard';
import { useStackStore } from '@/lib/stores/stackStore';
import { 
  Search, 
  Save, 
  Download, 
  Share2, 
  Sparkles,
  X,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function BuilderPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompatibilityWarnings, setShowCompatibilityWarnings] = useState(true);
  
  // Use Zustand store for stack state
  const {
    currentStack,
    setStackName,
    setStackDescription,
    addTechnology,
    removeTechnology,
    reorderTechnologies,
    clearCurrentStack,
    saveStack
  } = useStackStore();

  // Sample technologies - in real app, this would come from API
  const availableTechnologies: Technology[] = [
    {
      id: 'react',
      name: 'React',
      category: 'frontend',
      description: 'A JavaScript library for building user interfaces',
      setupTimeHours: 2,
      difficulty: 'intermediate',
      pricing: 'free',
      stars: 4.8,
      compatibility: {
        compatible: ['typescript', 'nextjs', 'tailwind'],
        incompatible: ['angular', 'vue'],
      },
    },
    {
      id: 'nextjs',
      name: 'Next.js',
      category: 'frontend',
      description: 'The React Framework for Production',
      setupTimeHours: 3,
      difficulty: 'intermediate',
      pricing: 'free',
      stars: 4.9,
      compatibility: {
        compatible: ['react', 'typescript', 'tailwind', 'vercel'],
        incompatible: ['gatsby'],
      },
    },
    {
      id: 'typescript',
      name: 'TypeScript',
      category: 'frontend',
      description: 'JavaScript with syntax for types',
      setupTimeHours: 1,
      difficulty: 'intermediate',
      pricing: 'free',
      stars: 4.7,
    },
    {
      id: 'tailwind',
      name: 'Tailwind CSS',
      category: 'frontend',
      description: 'A utility-first CSS framework',
      setupTimeHours: 1,
      difficulty: 'beginner',
      pricing: 'free',
      stars: 4.8,
    },
    {
      id: 'nodejs',
      name: 'Node.js',
      category: 'backend',
      description: 'JavaScript runtime built on Chrome V8 engine',
      setupTimeHours: 2,
      difficulty: 'intermediate',
      pricing: 'free',
      stars: 4.7,
    },
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      category: 'database',
      description: 'Powerful open source database',
      setupTimeHours: 3,
      difficulty: 'intermediate',
      pricing: 'free',
      stars: 4.8,
    },
    {
      id: 'supabase',
      name: 'Supabase',
      category: 'backend',
      description: 'Open source Firebase alternative',
      setupTimeHours: 2,
      difficulty: 'beginner',
      pricing: 'freemium',
      stars: 4.6,
      compatibility: {
        compatible: ['postgresql', 'nextjs'],
        incompatible: ['firebase'],
      },
    },
    {
      id: 'docker',
      name: 'Docker',
      category: 'devops',
      description: 'Container platform for apps',
      setupTimeHours: 4,
      difficulty: 'expert',
      pricing: 'freemium',
      stars: 4.6,
    },
    {
      id: 'vercel',
      name: 'Vercel',
      category: 'devops',
      description: 'Platform for frontend frameworks',
      setupTimeHours: 1,
      difficulty: 'beginner',
      pricing: 'freemium',
      stars: 4.7,
      compatibility: {
        compatible: ['nextjs', 'react'],
        incompatible: ['netlify'],
      },
    },
  ];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = currentStack.technologies.findIndex((item) => item.id === active.id);
      const newIndex = currentStack.technologies.findIndex((item) => item.id === over?.id);
      const reorderedTechnologies = arrayMove(currentStack.technologies, oldIndex, newIndex);
      reorderTechnologies(reorderedTechnologies);
    }
  };

  const handleAddTechnology = (tech: Technology) => {
    addTechnology(tech);
  };

  const handleRemoveTechnology = (techId: string) => {
    removeTechnology(techId);
  };

  const filteredTechnologies = availableTechnologies.filter(tech =>
    tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tech.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalSetupTime = currentStack.technologies.reduce((sum, tech) => sum + tech.setupTimeHours, 0);
  const averageDifficulty = currentStack.technologies.length > 0
    ? currentStack.technologies.filter(t => t.difficulty === 'expert').length > currentStack.technologies.length / 2
      ? 'expert'
      : currentStack.technologies.filter(t => t.difficulty === 'beginner').length > currentStack.technologies.length / 2
        ? 'beginner'
        : 'intermediate'
    : null;

  const checkCompatibility = () => {
    const warnings: string[] = [];
    currentStack.technologies.forEach(tech => {
      if (tech.compatibility?.incompatible) {
        tech.compatibility.incompatible.forEach(incompatibleId => {
          if (currentStack.technologies.find(t => t.id === incompatibleId)) {
            warnings.push(`${tech.name} is incompatible with ${incompatibleId}`);
          }
        });
      }
    });
    return warnings;
  };

  const compatibilityWarnings = checkCompatibility();

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-100">Stack Builder</h1>
          <p className="mt-2 text-lg text-slate-400">
            Drag and drop technologies to build your perfect stack
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Technology Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search */}
            <Input
              placeholder="Search technologies..."
              icon={<Search className="h-5 w-5" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Technology Categories */}
            <div className="space-y-6">
              {['frontend', 'backend', 'database', 'devops'].map(category => {
                const categoryTechs = filteredTechnologies.filter(t => t.category === category);
                if (categoryTechs.length === 0) return null;

                return (
                  <div key={category}>
                    <h3 className="mb-3 text-lg font-semibold capitalize text-slate-200">
                      {category}
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {categoryTechs.map(tech => (
                        <TechnologyCard
                          key={tech.id}
                          technology={tech}
                          isCompact
                          onSelect={() => handleAddTechnology(tech)}
                          selected={currentStack.technologies.some(t => t.id === tech.id)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Stack Builder */}
          <div className="space-y-6">
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Your Stack</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Name your stack..."
                  value={currentStack.name}
                  onChange={(e) => setStackName(e.target.value)}
                  className="mb-4"
                />

                {currentStack.technologies.length === 0 ? (
                  <div className="py-12 text-center">
                    <Sparkles className="mx-auto h-12 w-12 text-slate-600" />
                    <p className="mt-4 text-sm text-slate-400">
                      Start adding technologies to build your stack
                    </p>
                  </div>
                ) : (
                  <>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={currentStack.technologies.map(t => t.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3">
                          {currentStack.technologies.map((tech) => (
                            <div key={tech.id} className="relative">
                              <DraggableTechnologyCard
                                id={tech.id}
                                technology={tech}
                                isCompact
                              />
                              <button
                                onClick={() => handleRemoveTechnology(tech.id)}
                                className="absolute right-2 top-2 p-1 text-slate-400 hover:text-slate-300"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>

                    {/* Stack Stats */}
                    <div className="mt-6 space-y-3 border-t border-slate-700 pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Total Setup Time</span>
                        <span className="font-medium text-slate-200">{totalSetupTime} hours</span>
                      </div>
                      {averageDifficulty && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Difficulty</span>
                          <Badge
                            variant={
                              averageDifficulty === 'beginner' ? 'success' :
                              averageDifficulty === 'intermediate' ? 'warning' : 'danger'
                            }
                            size="sm"
                          >
                            {averageDifficulty}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Compatibility Warnings */}
                    {showCompatibilityWarnings && compatibilityWarnings.length > 0 && (
                      <div className="mt-4 rounded-lg bg-yellow-500/10 p-3">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-400" />
                          <div className="text-sm">
                            <p className="font-medium text-yellow-400">Compatibility Issues</p>
                            <ul className="mt-1 space-y-1 text-yellow-300">
                              {compatibilityWarnings.map((warning, i) => (
                                <li key={i}>{warning}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Actions */}
                <div className="mt-6 space-y-3">
                  <Button 
                    variant="primary" 
                    className="w-full"
                    disabled={currentStack.technologies.length === 0 || !currentStack.name}
                    onClick={() => {
                      saveStack({
                        name: currentStack.name,
                        description: currentStack.description || 'Custom stack built with BlueKit',
                        technologies: currentStack.technologies,
                        author: 'You',
                        stars: 0,
                        uses: 0,
                        difficulty: averageDifficulty as any || 'intermediate',
                        category: 'Custom',
                        isPublic: false,
                      });
                      // Show success message or redirect
                    }}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Stack
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="secondary"
                      disabled={currentStack.technologies.length === 0}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                    <Button 
                      variant="secondary"
                      disabled={currentStack.technologies.length === 0}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card variant="glass">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-5 w-5 flex-shrink-0 text-blue-400" />
                  <div className="text-sm">
                    <p className="font-medium text-slate-200">Pro Tips</p>
                    <ul className="mt-1 space-y-1 text-slate-400">
                      <li>• Drag technologies to reorder them</li>
                      <li>• Click on a technology to add it</li>
                      <li>• Check compatibility warnings</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}