import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { NodeData } from '@/components/ui/VisualBuilder/CanvasNode';
import { Connection } from '@/components/ui/VisualBuilder/ConnectionLine';
import { useCategoryStore } from '@/lib/stores/categoryStore';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  RotateCcw,
  Maximize2,
  Monitor,
  Users,
  Clock,
  DollarSign,
  Settings,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PresentationModeProps {
  isOpen: boolean;
  onClose: () => void;
  stackData: {
    name: string;
    description: string;
    nodes: NodeData[];
    connections: Connection[];
  };
  className?: string;
}

interface PresentationSlide {
  id: string;
  title: string;
  type: 'intro' | 'overview' | 'category' | 'technology' | 'summary';
  content: Record<string, unknown> | NodeData;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export function PresentationMode({ 
  isOpen, 
  onClose, 
  stackData,
  className 
}: PresentationModeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState<NodeJS.Timeout | null>(null);
  const { getAllCategories } = useCategoryStore();

  // Generate presentation slides
  const slides: PresentationSlide[] = (() => {
    if (!stackData || !stackData.nodes) {
      return [];
    }
    
    const allCategories = getAllCategories();
    const categoryGroups = stackData.nodes.reduce((acc, node) => {
      const category = allCategories.find(cat => cat.id === node.category) || 
                     { id: node.category, name: node.category, icon: '📦', color: '#64748B' };
      
      if (!acc[category.id]) {
        acc[category.id] = { category, nodes: [] };
      }
      acc[category.id].nodes.push(node);
      return acc;
    }, {} as Record<string, { category: { id: string; name: string; icon: string; color: string }; nodes: NodeData[] }>);

    const slidesList: PresentationSlide[] = [
      // Intro slide
      {
        id: 'intro',
        title: stackData.name,
        type: 'intro',
        content: {
          name: stackData.name,
          description: stackData.description,
          totalTechnologies: stackData.nodes.length,
          categories: Object.keys(categoryGroups).length
        }
      },
      // Overview slide
      {
        id: 'overview',
        title: 'Stack Overview',
        type: 'overview',
        content: {
          totalSetupTime: stackData.nodes.reduce((sum, node) => sum + node.setupTimeHours, 0),
          difficultyDistribution: stackData.nodes.reduce((acc, node) => {
            acc[node.difficulty] = (acc[node.difficulty] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          pricingDistribution: stackData.nodes.reduce((acc, node) => {
            acc[node.pricing] = (acc[node.pricing] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          categoryGroups
        }
      }
    ];

    // Add category slides
    Object.values(categoryGroups).forEach(({ category, nodes }) => {
      slidesList.push({
        id: `category-${category.id}`,
        title: `${category.name} Technologies`,
        type: 'category',
        content: { category, nodes }
      });
    });

    // Add individual technology slides for main technologies
    stackData.nodes
      .filter(node => node.isMainTechnology)
      .forEach(node => {
        slidesList.push({
          id: `tech-${node.id}`,
          title: node.name,
          type: 'technology',
          content: node
        });
      });

    // Summary slide
    slidesList.push({
      id: 'summary',
      title: 'Summary',
      type: 'summary',
      content: {
        mainTechnologies: stackData.nodes.filter(node => node.isMainTechnology).length,
        supportingTools: stackData.nodes.filter(node => !node.isMainTechnology).length,
        connections: stackData.connections.length,
        estimatedTime: stackData.nodes.reduce((sum, node) => sum + node.setupTimeHours, 0)
      }
    });

    return slidesList;
  })();

  const paginate = (newDirection: number) => {
    const nextSlide = currentSlide + newDirection;
    if (nextSlide >= 0 && nextSlide < slides.length) {
      setDirection(newDirection);
      setCurrentSlide(nextSlide);
    }
  };

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlay) {
      const interval = setInterval(() => {
        if (currentSlide < slides.length - 1) {
          paginate(1);
        } else {
          setIsAutoPlay(false);
        }
      }, 5000);
      setAutoPlayInterval(interval);
      return () => clearInterval(interval);
    } else if (autoPlayInterval) {
      clearInterval(autoPlayInterval);
      setAutoPlayInterval(null);
    }
  }, [isAutoPlay, currentSlide, slides.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          paginate(-1);
          break;
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          paginate(1);
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'Home':
          e.preventDefault();
          setCurrentSlide(0);
          break;
        case 'End':
          e.preventDefault();
          setCurrentSlide(slides.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, currentSlide, slides.length]);

  const renderSlideContent = (slide: PresentationSlide) => {
    switch (slide.type) {
      case 'intro':
        const introContent = slide.content as Record<string, unknown>;
        return (
          <div className="text-center space-y-8">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {introContent.name as string}
              </h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                {introContent.description as string}
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center gap-8"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {introContent.totalTechnologies as number}
                </div>
                <div className="text-sm text-slate-400">Technologies</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {introContent.categories as number}
                </div>
                <div className="text-sm text-slate-400">Categories</div>
              </div>
            </motion.div>
          </div>
        );

      case 'overview':
        const overviewContent = slide.content as Record<string, unknown>;
        const { totalSetupTime, difficultyDistribution, pricingDistribution } = overviewContent;
        return (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white text-center mb-8">Stack Overview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-8 h-8 text-blue-400" />
                    <h3 className="text-xl font-semibold text-white">Setup Time</h3>
                  </div>
                  <div className="text-3xl font-bold text-blue-400">
                    {totalSetupTime}h
                  </div>
                  <p className="text-sm text-slate-400">Estimated total setup</p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="w-8 h-8 text-purple-400" />
                    <h3 className="text-xl font-semibold text-white">Difficulty</h3>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(difficultyDistribution as Record<string, number>).map(([level, count]) => (
                      <div key={level} className="flex justify-between items-center">
                        <span className="text-sm text-slate-300 capitalize">{level}</span>
                        <Badge variant="default" size="sm">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="w-8 h-8 text-green-400" />
                    <h3 className="text-xl font-semibold text-white">Pricing</h3>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(pricingDistribution as Record<string, number>).map(([pricing, count]) => (
                      <div key={pricing} className="flex justify-between items-center">
                        <span className="text-sm text-slate-300 capitalize">{pricing}</span>
                        <Badge variant="default" size="sm">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        );

      case 'category':
        const categoryContent = slide.content as Record<string, unknown>;
        const { category, nodes } = categoryContent;
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div 
                className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl"
                style={{ backgroundColor: `${category.color}20` }}
              >
                {category.icon}
              </div>
              <h2 className="text-4xl font-bold text-white">{category.name}</h2>
              <p className="text-xl text-slate-300">{category.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {nodes.map((node: NodeData, index: number) => (
                <motion.div
                  key={node.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 bg-slate-800/50 border-slate-700">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold text-white">{node.name}</h3>
                      {node.isMainTechnology && (
                        <Badge variant="primary" size="sm">Main</Badge>
                      )}
                    </div>
                    <p className="text-slate-300 mb-4">{node.description}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="default" size="sm">
                        {node.setupTimeHours}h setup
                      </Badge>
                      <Badge 
                        variant={node.difficulty === 'beginner' ? 'success' : 
                               node.difficulty === 'intermediate' ? 'warning' : 'danger'} 
                        size="sm"
                      >
                        {node.difficulty}
                      </Badge>
                      <Badge 
                        variant={node.pricing === 'free' ? 'success' : 
                               node.pricing === 'freemium' ? 'warning' : 'danger'} 
                        size="sm"
                      >
                        {node.pricing}
                      </Badge>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'technology':
        const tech = slide.content as NodeData;
        return (
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-5xl font-bold text-white mb-4">{tech.name}</h2>
              <p className="text-xl text-slate-300 mb-8">{tech.description}</p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                <Clock className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-blue-400">{tech.setupTimeHours}h</div>
                <p className="text-sm text-slate-400">Setup Time</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <Target className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-purple-400 capitalize">{tech.difficulty}</div>
                <p className="text-sm text-slate-400">Difficulty</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <DollarSign className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-green-400 capitalize">{tech.pricing}</div>
                <p className="text-sm text-slate-400">Pricing</p>
              </Card>
            </motion.div>

            {((tech.compatibleWith && tech.compatibleWith.length > 0) || (tech.incompatibleWith && tech.incompatibleWith.length > 0)) && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {tech.compatibleWith && tech.compatibleWith.length > 0 && (
                  <Card className="p-6 bg-green-500/5 border-green-500/20">
                    <h4 className="text-lg font-semibold text-green-400 mb-3">Compatible With</h4>
                    <div className="flex flex-wrap gap-2">
                      {tech.compatibleWith.map((compat: string) => (
                        <Badge key={compat} variant="success" size="sm">
                          {compat}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                )}

                {tech.incompatibleWith && tech.incompatibleWith.length > 0 && (
                  <Card className="p-6 bg-red-500/5 border-red-500/20">
                    <h4 className="text-lg font-semibold text-red-400 mb-3">Incompatible With</h4>
                    <div className="flex flex-wrap gap-2">
                      {tech.incompatibleWith.map((incompat: string) => (
                        <Badge key={incompat} variant="danger" size="sm">
                          {incompat}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                )}
              </motion.div>
            )}
          </div>
        );

      case 'summary':
        const summary = slide.content as Record<string, unknown>;
        return (
          <div className="text-center space-y-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-5xl font-bold text-white mb-4">Summary</h2>
              <p className="text-xl text-slate-300">Your technology stack overview</p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                <Zap className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-blue-400">{summary.mainTechnologies as number}</div>
                <p className="text-sm text-slate-400">Main Technologies</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <Settings className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-purple-400">{summary.supportingTools as number}</div>
                <p className="text-sm text-slate-400">Supporting Tools</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <BarChart3 className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-green-400">{summary.connections as number}</div>
                <p className="text-sm text-slate-400">Connections</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
                <Clock className="w-10 h-10 text-orange-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-orange-400">{summary.estimatedTime as number}h</div>
                <p className="text-sm text-slate-400">Total Setup</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-lg text-slate-300">
                Ready to build something amazing! 🚀
              </p>
            </motion.div>
          </div>
        );

      default:
        return <div>Slide content not found</div>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
          <div className="text-sm text-slate-400">
            {currentSlide + 1} / {slides.length}
          </div>
          <div className="text-sm text-white font-medium">
            {slides[currentSlide]?.title}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAutoPlay(!isAutoPlay)}
            className={cn(
              "text-slate-400 hover:text-white",
              isAutoPlay && "text-blue-400"
            )}
          >
            {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentSlide(0)}
            className="text-slate-400 hover:text-white"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              }
            }}
            className="w-full h-full flex items-center justify-center"
          >
            <div className="w-full max-w-6xl">
              {renderSlideContent(slides[currentSlide])}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm border-t border-slate-700">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => paginate(-1)}
          disabled={currentSlide === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index === currentSlide 
                  ? "bg-blue-400 w-8" 
                  : "bg-slate-600 hover:bg-slate-500"
              )}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => paginate(1)}
          disabled={currentSlide === slides.length - 1}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Keyboard shortcuts help */}
      <div className="absolute bottom-4 left-4 text-xs text-slate-500 space-y-1">
        <div>← → Navigation</div>
        <div>Space: Next slide</div>
        <div>Esc: Exit presentation</div>
      </div>
    </div>
  );
}