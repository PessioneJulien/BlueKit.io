import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AnimatedModal } from '@/components/ui/animated/AnimatedModal';
import { AnimatedCard } from '@/components/ui/animated/AnimatedCard';
import { StackComparer, StackComparison as ComparisonResult, StackData } from '@/lib/comparison/stackComparer';
import { NodeData } from '@/components/ui/VisualBuilder/CanvasNode';
import { Connection } from '@/components/ui/VisualBuilder/ConnectionLine';
import { 
  ArrowRight,
  Trophy,
  BarChart3,
  GitCompare,
  X,
  Crown,
  Target,
  Zap,
  DollarSign,
  Clock,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StackComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  currentStack: {
    name: string;
    description: string;
    nodes: NodeData[];
    connections: Connection[];
  };
  className?: string;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'complexity':
      return <Target className="w-4 h-4" />;
    case 'performance':
      return <Zap className="w-4 h-4" />;
    case 'cost':
      return <DollarSign className="w-4 h-4" />;
    case 'maintainability':
      return <BookOpen className="w-4 h-4" />;
    case 'scalability':
      return <BarChart3 className="w-4 h-4" />;
    default:
      return <Target className="w-4 h-4" />;
  }
};

const getWinnerIcon = (winner: string) => {
  switch (winner) {
    case 'stack1':
    case 'stack2':
      return <Crown className="w-4 h-4 text-yellow-400" />;
    case 'tie':
      return <Minus className="w-4 h-4 text-slate-400" />;
    default:
      return <Minus className="w-4 h-4 text-slate-400" />;
  }
};

// Stacks prédéfinies pour la comparaison
const COMPARISON_STACKS: StackData[] = [
  {
    id: 'mern-stack',
    name: 'MERN Stack',
    description: 'MongoDB, Express, React, Node.js',
    nodes: [
      { id: 'react', name: 'React', category: 'frontend', description: 'UI Library', setupTimeHours: 2, difficulty: 'intermediate', pricing: 'free', isMainTechnology: true },
      { id: 'nodejs', name: 'Node.js', category: 'backend', description: 'Runtime', setupTimeHours: 2, difficulty: 'intermediate', pricing: 'free', isMainTechnology: true },
      { id: 'express', name: 'Express', category: 'backend', description: 'Web Framework', setupTimeHours: 1, difficulty: 'beginner', pricing: 'free', isMainTechnology: false },
      { id: 'mongodb', name: 'MongoDB', category: 'database', description: 'NoSQL Database', setupTimeHours: 2, difficulty: 'beginner', pricing: 'freemium', isMainTechnology: true }
    ],
    connections: [],
    author: 'Community',
    createdAt: new Date()
  },
  {
    id: 'next-supabase',
    name: 'Next.js + Supabase',
    description: 'Modern full-stack with Next.js and Supabase',
    nodes: [
      { id: 'nextjs', name: 'Next.js', category: 'frontend', description: 'React Framework', setupTimeHours: 3, difficulty: 'intermediate', pricing: 'free', isMainTechnology: true },
      { id: 'supabase', name: 'Supabase', category: 'database', description: 'Backend as a Service', setupTimeHours: 2, difficulty: 'beginner', pricing: 'freemium', isMainTechnology: true },
      { id: 'typescript', name: 'TypeScript', category: 'frontend', description: 'Type Safety', setupTimeHours: 2, difficulty: 'intermediate', pricing: 'free', isMainTechnology: false },
      { id: 'tailwind', name: 'Tailwind CSS', category: 'ui-ux', description: 'Utility CSS', setupTimeHours: 1, difficulty: 'beginner', pricing: 'free', isMainTechnology: false }
    ],
    connections: [],
    author: 'Community',
    createdAt: new Date()
  },
  {
    id: 'vue-firebase',
    name: 'Vue + Firebase',
    description: 'Vue.js with Firebase backend',
    nodes: [
      { id: 'vue', name: 'Vue.js', category: 'frontend', description: 'Progressive Framework', setupTimeHours: 2, difficulty: 'beginner', pricing: 'free', isMainTechnology: true },
      { id: 'firebase', name: 'Firebase', category: 'database', description: 'Google Backend', setupTimeHours: 2, difficulty: 'beginner', pricing: 'freemium', isMainTechnology: true },
      { id: 'typescript', name: 'TypeScript', category: 'frontend', description: 'Type Safety', setupTimeHours: 2, difficulty: 'intermediate', pricing: 'free', isMainTechnology: false }
    ],
    connections: [],
    author: 'Community',
    createdAt: new Date()
  },
  {
    id: 'laravel-stack',
    name: 'Laravel Full-Stack',
    description: 'PHP Laravel with traditional architecture',
    nodes: [
      { id: 'laravel', name: 'Laravel', category: 'backend', description: 'PHP Framework', setupTimeHours: 4, difficulty: 'intermediate', pricing: 'free', isMainTechnology: true },
      { id: 'mysql', name: 'MySQL', category: 'database', description: 'Relational Database', setupTimeHours: 2, difficulty: 'beginner', pricing: 'free', isMainTechnology: true },
      { id: 'blade', name: 'Blade Templates', category: 'frontend', description: 'Templating Engine', setupTimeHours: 1, difficulty: 'beginner', pricing: 'free', isMainTechnology: false }
    ],
    connections: [],
    author: 'Community',
    createdAt: new Date()
  }
];

export function StackComparison({ 
  isOpen, 
  onClose, 
  currentStack,
  className 
}: StackComparisonProps) {
  const [selectedComparisonStack, setSelectedComparisonStack] = useState<StackData | null>(null);
  const [selectedView, setSelectedView] = useState<'metrics' | 'technologies' | 'recommendations'>('metrics');

  const comparison: ComparisonResult | null = useMemo(() => {
    if (!selectedComparisonStack) return null;
    
    const currentStackData: StackData = {
      id: 'current',
      name: currentStack.name || 'Current Stack',
      description: currentStack.description || 'Your current stack',
      nodes: currentStack.nodes,
      connections: currentStack.connections,
    };

    return StackComparer.compareStacks(currentStackData, selectedComparisonStack);
  }, [currentStack, selectedComparisonStack]);

  if (!isOpen) return null;

  return (
    <AnimatedModal 
      isOpen={isOpen} 
      onClose={onClose}
      className={cn(
        'relative w-full max-w-7xl mx-4 bg-slate-900 border-slate-700 max-h-[90vh] overflow-hidden rounded-lg border',
        className
      )}
    >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <GitCompare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Stack Comparison</h2>
                <p className="text-sm text-slate-400 font-normal">
                  Compare your stack with popular alternatives
                </p>
              </div>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          {!selectedComparisonStack ? (
            /* Stack Selection */
            <div className="space-y-4">
              <h3 className="font-semibold text-white text-lg">Choose a Stack to Compare</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {COMPARISON_STACKS.map((stack, index) => (
                  <AnimatedCard 
                    key={stack.id} 
                    className="p-4 border border-slate-600/50 bg-slate-800/50 backdrop-blur-sm rounded-lg hover:border-blue-500/40 transition-colors duration-200"
                    onClick={() => setSelectedComparisonStack(stack)}
                    delay={index * 0.1}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white">{stack.name}</h4>
                      <Badge variant="outline" size="sm">
                        {stack.nodes.length} techs
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-300 mb-3">{stack.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {stack.nodes.slice(0, 4).map(node => (
                        <Badge key={node.id} variant="outline" size="sm" className="text-xs">
                          {node.name}
                        </Badge>
                      ))}
                      {stack.nodes.length > 4 && (
                        <Badge variant="outline" size="sm" className="text-xs">
                          +{stack.nodes.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            </div>
          ) : comparison && (
            /* Comparison Results */
            <div className="space-y-6">
              {/* Header with stacks info */}
              <div className="grid grid-cols-3 gap-4 items-center">
                <Card variant="glass" className="p-4 text-center">
                  <h3 className="font-bold text-lg text-white mb-2">
                    {comparison.stack1.name}
                  </h3>
                  <p className="text-sm text-slate-400 mb-3">
                    {comparison.stack1.description}
                  </p>
                  <Badge variant="primary" size="sm">
                    {comparison.stack1.nodes.length} technologies
                  </Badge>
                </Card>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-4 mb-2">
                    <ArrowRight className="w-6 h-6 text-slate-400" />
                    <div className="text-lg font-bold text-white">VS</div>
                    <ArrowRight className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-slate-300">
                      {comparison.overallWinner === 'tie' 
                        ? 'Tied' 
                        : comparison.overallWinner === 'stack1' 
                          ? comparison.stack1.name 
                          : comparison.stack2.name} wins
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {comparison.similarityScore}% similar
                  </div>
                </div>

                <Card variant="glass" className="p-4 text-center">
                  <h3 className="font-bold text-lg text-white mb-2">
                    {comparison.stack2.name}
                  </h3>
                  <p className="text-sm text-slate-400 mb-3">
                    {comparison.stack2.description}
                  </p>
                  <Badge variant="secondary" size="sm">
                    {comparison.stack2.nodes.length} technologies
                  </Badge>
                </Card>
              </div>

              {/* View Tabs */}
              <div className="flex gap-2 border-b border-slate-700">
                {[
                  { key: 'metrics', label: 'Metrics', icon: BarChart3 },
                  { key: 'technologies', label: 'Technologies', icon: Target },
                  { key: 'recommendations', label: 'Recommendations', icon: Lightbulb }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <Button
                      key={tab.key}
                      variant={selectedView === tab.key ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedView(tab.key as 'metrics' | 'technologies' | 'recommendations')}
                      className="flex items-center gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </Button>
                  );
                })}
              </div>

              {/* Content Views */}
              {selectedView === 'metrics' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-white text-lg">Performance Metrics</h3>
                  <div className="space-y-3">
                    {comparison.metrics.map((metric, index) => (
                      <Card key={index} variant="glass" className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(metric.category)}
                            <h4 className="font-semibold text-white">{metric.name}</h4>
                          </div>
                          {getWinnerIcon(metric.winner)}
                        </div>
                        <p className="text-xs text-slate-400 mb-3">{metric.description}</p>
                        <div className="grid grid-cols-3 gap-4 items-center">
                          <div className={cn(
                            'text-center p-2 rounded',
                            metric.winner === 'stack1' ? 'bg-green-500/20 border border-green-500/30' : 'bg-slate-800/50'
                          )}>
                            <div className="font-bold text-white">{metric.stack1Value}</div>
                            <div className="text-xs text-slate-400">{comparison.stack1.name}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-slate-400">vs</div>
                          </div>
                          <div className={cn(
                            'text-center p-2 rounded',
                            metric.winner === 'stack2' ? 'bg-green-500/20 border border-green-500/30' : 'bg-slate-800/50'
                          )}>
                            <div className="font-bold text-white">{metric.stack2Value}</div>
                            <div className="text-xs text-slate-400">{comparison.stack2.name}</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {selectedView === 'technologies' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-white text-lg">Technology Comparison</h3>
                  <div className="space-y-4">
                    {comparison.technologyComparison.map((cat) => (
                      <Card key={cat.category} variant="glass" className="p-4">
                        <h4 className="font-semibold text-white mb-3 capitalize">{cat.category}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Common Technologies */}
                          {cat.commonTechnologies.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                                <h5 className="text-sm font-medium text-green-400">Common</h5>
                              </div>
                              <div className="space-y-1">
                                {cat.commonTechnologies.map(tech => (
                                  <Badge key={tech.id} variant="success" size="sm" className="block w-fit">
                                    {tech.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Unique to Stack 1 */}
                          {cat.uniqueToStack1.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4 text-blue-400" />
                                <h5 className="text-sm font-medium text-blue-400">{comparison.stack1.name} Only</h5>
                              </div>
                              <div className="space-y-1">
                                {cat.uniqueToStack1.map(tech => (
                                  <Badge key={tech.id} variant="primary" size="sm" className="block w-fit">
                                    {tech.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Unique to Stack 2 */}
                          {cat.uniqueToStack2.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4 text-purple-400" />
                                <h5 className="text-sm font-medium text-purple-400">{comparison.stack2.name} Only</h5>
                              </div>
                              <div className="space-y-1">
                                {cat.uniqueToStack2.map(tech => (
                                  <Badge key={tech.id} variant="secondary" size="sm" className="block w-fit">
                                    {tech.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {selectedView === 'recommendations' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-white text-lg">Recommendations</h3>
                  {comparison.recommendations.length > 0 ? (
                    <div className="space-y-3">
                      {comparison.recommendations.map((rec) => (
                        <Card key={rec.id} variant="glass" className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                              <Lightbulb className="w-4 h-4 text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-white">{rec.title}</h4>
                                <Badge 
                                  variant={rec.impact === 'high' ? 'danger' : rec.impact === 'medium' ? 'warning' : 'default'} 
                                  size="sm"
                                >
                                  {rec.impact} impact
                                </Badge>
                              </div>
                              <p className="text-sm text-slate-300">{rec.description}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card variant="glass" className="p-8 text-center">
                      <CheckCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-white mb-2">
                        Well-Balanced Comparison
                      </h4>
                      <p className="text-slate-400">
                        Both stacks have their strengths. The choice depends on your specific requirements.
                      </p>
                    </Card>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <Button
                  variant="outline"
                  onClick={() => setSelectedComparisonStack(null)}
                  className="flex-1"
                >
                  Compare Different Stack
                </Button>
                <Button
                  variant="primary"
                  onClick={onClose}
                  className="flex-1"
                >
                  Close Comparison
                </Button>
              </div>
            </div>
          )}
        </CardContent>
    </AnimatedModal>
  );
}