import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AnimatedModal } from '@/components/ui/animated/AnimatedModal';
import { AnimatedCard } from '@/components/ui/animated/AnimatedCard';
import { StackAnalyzer, StackAnalysis, StackSuggestion } from '@/lib/ai/stackAnalyzer';
import { NodeData } from '@/components/ui/VisualBuilder/CanvasNode';
import { 
  Bot, 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  Plus,
  X,
  Zap,
  Target,
  Wrench,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  technologies: NodeData[];
  onAddTechnology: (technology: NodeData) => void;
  className?: string;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'missing_essential':
      return <AlertTriangle className="w-4 h-4 text-red-400" />;
    case 'enhancement':
      return <Sparkles className="w-4 h-4 text-blue-400" />;
    case 'alternative':
      return <Wrench className="w-4 h-4 text-yellow-400" />;
    case 'optimization':
      return <TrendingUp className="w-4 h-4 text-green-400" />;
    default:
      return <Lightbulb className="w-4 h-4 text-slate-400" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'missing_essential':
      return 'border-red-500/20 bg-red-500/10';
    case 'enhancement':
      return 'border-blue-500/20 bg-blue-500/10';
    case 'alternative':
      return 'border-yellow-500/20 bg-yellow-500/10';
    case 'optimization':
      return 'border-green-500/20 bg-green-500/10';
    default:
      return 'border-slate-500/20 bg-slate-500/10';
  }
};

const getComplexityColor = (complexity: string) => {
  switch (complexity) {
    case 'simple':
      return 'text-green-400';
    case 'moderate':
      return 'text-blue-400';
    case 'complex':
      return 'text-yellow-400';
    case 'enterprise':
      return 'text-red-400';
    default:
      return 'text-slate-400';
  }
};

export function AIAssistant({ 
  isOpen, 
  onClose, 
  technologies, 
  onAddTechnology,
  className 
}: AIAssistantProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const analysis: StackAnalysis = useMemo(() => {
    return StackAnalyzer.analyzeStack(technologies);
  }, [technologies]);

  const filteredSuggestions = useMemo(() => {
    if (selectedCategory === 'all') return analysis.suggestions;
    return analysis.suggestions.filter(s => s.category === selectedCategory);
  }, [analysis.suggestions, selectedCategory]);

  if (!isOpen) return null;

  const categoryFilters = [
    { key: 'all', label: 'All', count: analysis.suggestions.length },
    { key: 'missing_essential', label: 'Essential', count: analysis.suggestions.filter(s => s.category === 'missing_essential').length },
    { key: 'enhancement', label: 'Enhancement', count: analysis.suggestions.filter(s => s.category === 'enhancement').length },
    { key: 'optimization', label: 'Popular', count: analysis.suggestions.filter(s => s.category === 'optimization').length },
  ].filter(f => f.count > 0);

  return (
    <AnimatedModal 
      isOpen={isOpen} 
      onClose={onClose}
      className={cn(
        'relative w-full max-w-4xl mx-4 bg-slate-900 border-slate-700 max-h-[90vh] overflow-hidden rounded-lg border',
        className
      )}
    >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">AI Stack Assistant</h2>
                <p className="text-sm text-slate-400 font-normal">
                  Intelligent suggestions for your technology stack
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
          {/* Stack Analysis Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Overall Score */}
            <Card variant="glass" className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {analysis.overallScore}%
                  </div>
                  <div className="text-sm text-slate-400">Stack Score</div>
                </div>
              </div>
            </Card>

            {/* Complexity */}
            <Card variant="glass" className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className={cn("text-lg font-bold capitalize", getComplexityColor(analysis.complexity))}>
                    {analysis.complexity}
                  </div>
                  <div className="text-sm text-slate-400">Complexity</div>
                </div>
              </div>
            </Card>

            {/* Technologies Count */}
            <Card variant="glass" className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    {technologies.length}
                  </div>
                  <div className="text-sm text-slate-400">Technologies</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            {analysis.strengths.length > 0 && (
              <Card variant="glass" className="p-4">
                <h3 className="font-semibold text-green-400 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength, index) => (
                    <li key={index} className="text-sm text-slate-300 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Weaknesses */}
            {analysis.weaknesses.length > 0 && (
              <Card variant="glass" className="p-4">
                <h3 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {analysis.weaknesses.map((weakness, index) => (
                    <li key={index} className="text-sm text-slate-300 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                      {weakness}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {/* Suggestions Section */}
          {analysis.suggestions.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-400" />
                  Intelligent Suggestions
                </h3>
                
                {/* Category Filters */}
                <div className="flex gap-2">
                  {categoryFilters.map(filter => (
                    <Button
                      key={filter.key}
                      variant={selectedCategory === filter.key ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedCategory(filter.key)}
                      className="text-xs"
                    >
                      {filter.label} ({filter.count})
                    </Button>
                  ))}
                </div>
              </div>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSuggestions.map((suggestion, index) => (
                  <AnimatedCard 
                    key={suggestion.id} 
                    className={cn(
                      'p-4 border border-slate-600/50 bg-slate-800/50 backdrop-blur-sm rounded-lg transition-colors duration-200 hover:border-blue-500/40',
                      getCategoryColor(suggestion.category)
                    )}
                    delay={index * 0.1}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(suggestion.category)}
                        <h4 className="font-semibold text-white">
                          {suggestion.technology.name}
                        </h4>
                      </div>
                      <Badge variant="outline" size="sm" className="text-xs">
                        {suggestion.confidence}% confidence
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-slate-300 mb-3">
                      {suggestion.technology.description}
                    </p>
                    
                    <p className="text-xs text-slate-400 mb-3 italic">
                      {suggestion.reason}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {suggestion.tags.map(tag => (
                          <Badge key={tag} variant="outline" size="sm" className="text-xs px-1.5 py-0.5">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onAddTechnology(suggestion.technology)}
                        className="flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add
                      </Button>
                    </div>
                  </AnimatedCard>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {analysis.suggestions.length === 0 && (
            <Card variant="glass" className="p-8 text-center">
              <Bot className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Excellent Stack!
              </h3>
              <p className="text-slate-400">
                Your current technology stack looks well-balanced. No immediate suggestions at this time.
              </p>
            </Card>
          )}
        </CardContent>
    </AnimatedModal>
  );
}