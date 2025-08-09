import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { AnimatedModal } from '@/components/ui/animated/AnimatedModal';
import { AnimatedCard } from '@/components/ui/animated/AnimatedCard';
import { CostCalculator as Calculator, CostAnalysis, CostBreakdown } from '@/lib/cost/costCalculator';
import { NodeData } from '@/components/ui/VisualBuilder/CanvasNode';
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Users,
  X,
  Calendar,
  CreditCard,
  Zap,
  Target,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CostCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  technologies: NodeData[];
  className?: string;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'hosting':
      return <Zap className="w-4 h-4" />;
    case 'license':
      return <CreditCard className="w-4 h-4" />;
    case 'service':
      return <Target className="w-4 h-4" />;
    case 'development':
      return <Users className="w-4 h-4" />;
    case 'maintenance':
      return <TrendingUp className="w-4 h-4" />;
    default:
      return <Info className="w-4 h-4" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'hosting':
      return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    case 'license':
      return 'text-green-400 bg-green-500/10 border-green-500/20';
    case 'service':
      return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    case 'development':
      return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    case 'maintenance':
      return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    default:
      return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  }
};

const getRecommendationIcon = (type: string) => {
  switch (type) {
    case 'optimization':
      return <TrendingDown className="w-4 h-4 text-green-400" />;
    case 'alternative':
      return <Lightbulb className="w-4 h-4 text-blue-400" />;
    case 'warning':
      return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    default:
      return <Info className="w-4 h-4 text-slate-400" />;
  }
};

export function CostCalculator({ 
  isOpen, 
  onClose, 
  technologies,
  className 
}: CostCalculatorProps) {
  const [userCount, setUserCount] = useState(1000);
  const [complexity, setComplexity] = useState<'simple' | 'moderate' | 'complex' | 'enterprise'>('moderate');
  const [selectedView, setSelectedView] = useState<'breakdown' | 'scaling' | 'recommendations'>('breakdown');

  const analysis: CostAnalysis = useMemo(() => {
    return Calculator.analyzeCosts(technologies, userCount, complexity);
  }, [technologies, userCount, complexity]);

  if (!isOpen) return null;

  return (
    <AnimatedModal 
      isOpen={isOpen} 
      onClose={onClose}
      className={cn(
        'relative w-full max-w-6xl mx-4 bg-slate-900 border-slate-700 max-h-[90vh] overflow-hidden rounded-lg border',
        className
      )}
    >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Cost Calculator</h2>
                <p className="text-sm text-slate-400 font-normal">
                  Detailed cost analysis for your technology stack
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
          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card variant="glass" className="p-4">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                Expected Users
              </h3>
              <div className="space-y-2">
                <input
                  type="range"
                  min="100"
                  max="100000"
                  step="100"
                  value={userCount}
                  onChange={(e) => setUserCount(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-slate-400">
                  <span>100</span>
                  <span className="font-semibold text-white">{userCount.toLocaleString()} users</span>
                  <span>100K</span>
                </div>
              </div>
            </Card>

            <Card variant="glass" className="p-4">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                Project Complexity
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {(['simple', 'moderate', 'complex', 'enterprise'] as const).map(level => (
                  <Button
                    key={level}
                    variant={complexity === level ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setComplexity(level)}
                    className="text-xs capitalize"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          {/* Cost Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="glass" className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    ${analysis.totalMonthlyCost.toFixed(0)}
                  </div>
                  <div className="text-sm text-slate-400">Monthly Cost</div>
                </div>
              </div>
            </Card>

            <Card variant="glass" className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    ${analysis.totalYearlyCost.toFixed(0)}
                  </div>
                  <div className="text-sm text-slate-400">Yearly Cost</div>
                </div>
              </div>
            </Card>

            <Card variant="glass" className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">
                    ${analysis.totalOneTimeCost.toFixed(0)}
                  </div>
                  <div className="text-sm text-slate-400">One-time Cost</div>
                </div>
              </div>
            </Card>
          </div>

          {/* View Tabs */}
          <div className="flex gap-2 border-b border-slate-700">
            {[
              { key: 'breakdown', label: 'Cost Breakdown', icon: DollarSign },
              { key: 'scaling', label: 'Scaling Projections', icon: TrendingUp },
              { key: 'recommendations', label: 'Recommendations', icon: Lightbulb }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.key}
                  variant={selectedView === tab.key ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedView(tab.key as 'breakdown' | 'scaling' | 'recommendations')}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>

          {/* Content Views */}
          {selectedView === 'breakdown' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-white text-lg">Cost Breakdown by Technology</h3>
              <div className="grid gap-4">
                {analysis.breakdown.map((breakdown) => (
                  <Card key={breakdown.technology} variant="glass" className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white">{breakdown.technology}</h4>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          ${(breakdown.monthlyTotal + breakdown.oneTimeTotal / 12).toFixed(0)}/mo
                        </div>
                        <div className="text-xs text-slate-400">
                          ${breakdown.oneTimeTotal > 0 ? breakdown.oneTimeTotal.toFixed(0) + ' one-time' : '0 setup'}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {breakdown.items.map((item) => (
                        <div 
                          key={item.id} 
                          className={cn(
                            'flex items-center justify-between p-2 rounded border',
                            getCategoryColor(item.category)
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(item.category)}
                            <div>
                              <div className="text-sm font-medium text-white">{item.name}</div>
                              <div className="text-xs text-slate-400">{item.description}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" size="sm" className="capitalize">
                              {item.tier}
                            </Badge>
                            <div className="text-sm font-medium text-white mt-1">
                              ${item.basePrice}{item.costType === 'monthly' ? '/mo' : 
                                item.costType === 'yearly' ? '/yr' : 
                                item.costType === 'one_time' ? ' once' : 
                                item.costType === 'per_user' ? '/user' : '/req'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {selectedView === 'scaling' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-white text-lg">Scaling Projections</h3>
              <div className="grid gap-4">
                {analysis.scalingProjections.map((projection) => (
                  <Card key={projection.userCount} variant="glass" className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-white">
                        {projection.userCount.toLocaleString()} Users
                      </h4>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          ${projection.monthlyEstimate.toFixed(0)}/mo
                        </div>
                        <div className="text-sm text-slate-400">
                          ${projection.yearlyEstimate.toFixed(0)}/year
                        </div>
                      </div>
                    </div>
                    {projection.recommendations.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-slate-300 mb-2">Recommendations:</h5>
                        <ul className="space-y-1">
                          {projection.recommendations.map((rec, index) => (
                            <li key={index} className="text-xs text-slate-400 flex items-start gap-2">
                              <div className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {selectedView === 'recommendations' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-white text-lg">Cost Optimization Recommendations</h3>
              {analysis.recommendations.length > 0 ? (
                <div className="space-y-3">
                  {analysis.recommendations.map((rec) => (
                    <Card key={rec.id} variant="glass" className="p-4">
                      <div className="flex items-start gap-3">
                        {getRecommendationIcon(rec.type)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-white">{rec.title}</h4>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={rec.impact === 'high' ? 'danger' : rec.impact === 'medium' ? 'warning' : 'default'} 
                                size="sm"
                              >
                                {rec.impact} impact
                              </Badge>
                              {rec.potentialSavings && (
                                <Badge variant="success" size="sm">
                                  Save ${rec.potentialSavings}/mo
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-slate-300">{rec.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card variant="glass" className="p-8 text-center">
                  <DollarSign className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Optimized Stack!
                  </h4>
                  <p className="text-slate-400">
                    Your technology choices look cost-effective. No immediate optimizations suggested.
                  </p>
                </Card>
              )}
            </div>
          )}
        </CardContent>
    </AnimatedModal>
  );
}