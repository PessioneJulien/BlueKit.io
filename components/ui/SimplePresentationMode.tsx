import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { NodeData } from '@/components/ui/VisualBuilder/CanvasNode';
import { Connection } from '@/components/ui/VisualBuilder/ConnectionLine';
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

interface SimplePresentationModeProps {
  isOpen: boolean;
  onClose: () => void;
  stackData: {
    name: string;
    description: string;
    nodes: NodeData[];
    connections: Connection[];
  };
}

interface PresentationSlide {
  id: string;
  title: string;
  type: 'intro' | 'overview' | 'category' | 'technology' | 'summary';
  content: any;
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

const categoryIcons: Record<string, string> = {
  frontend: '🎨',
  backend: '⚙️',
  database: '💾',
  devops: '🚀',
  mobile: '📱',
  ai: '🧠',
  other: '🔧'
};

export const SimplePresentationMode: React.FC<SimplePresentationModeProps> = ({
  isOpen,
  onClose,
  stackData
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [direction, setDirection] = useState(0);

  // Generate slides from stack data
  const slides: PresentationSlide[] = [
    // Intro slide
    {
      id: 'intro',
      title: 'Introduction',
      type: 'intro',
      content: {
        name: stackData.name,
        description: stackData.description,
        nodeCount: stackData.nodes.length,
        connectionCount: stackData.connections.length
      }
    },
    // Overview slide
    {
      id: 'overview',
      title: 'Stack Overview',
      type: 'overview',
      content: {
        categories: Array.from(new Set(stackData.nodes.map(n => n.category))),
        totalSetupTime: stackData.nodes.reduce((sum, node) => sum + node.setupTimeHours, 0),
        difficulties: stackData.nodes.map(n => n.difficulty)
      }
    },
    // Individual technology slides
    ...stackData.nodes.map(node => ({
      id: node.id,
      title: node.name,
      type: 'technology' as const,
      content: node
    })),
    // Summary slide
    {
      id: 'summary',
      title: 'Summary',
      type: 'summary',
      content: {
        name: stackData.name,
        technologies: stackData.nodes,
        benefits: ['Modern stack', 'Scalable architecture', 'Developer friendly']
      }
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || !isOpen) return;

    const timer = setInterval(() => {
      if (currentSlide < slides.length - 1) {
        navigateSlide(1);
      } else {
        setIsAutoPlaying(false);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, currentSlide, slides.length, isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          navigateSlide(-1);
          break;
        case 'ArrowRight':
          navigateSlide(1);
          break;
        case 'Escape':
          onClose();
          break;
        case ' ':
          e.preventDefault();
          setIsAutoPlaying(!isAutoPlaying);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isAutoPlaying, onClose]);

  const navigateSlide = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentSlide(prev => 
      Math.max(0, Math.min(slides.length - 1, prev + newDirection))
    );
  };

  const renderSlideContent = (slide: PresentationSlide) => {
    switch (slide.type) {
      case 'intro':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <motion.h1 
              className="text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {slide.content.name}
            </motion.h1>
            <motion.p 
              className="text-xl text-slate-300 mb-8 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {slide.content.description}
            </motion.p>
            <motion.div 
              className="flex gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400">{slide.content.nodeCount}</div>
                <div className="text-slate-400 mt-2">Technologies</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-400">{slide.content.connectionCount}</div>
                <div className="text-slate-400 mt-2">Connections</div>
              </div>
            </motion.div>
          </div>
        );

      case 'overview':
        const totalTime = slide.content.totalSetupTime;
        const avgDifficulty = slide.content.difficulties.reduce((acc, d) => 
          acc + (d === 'beginner' ? 1 : d === 'intermediate' ? 2 : 3), 0
        ) / slide.content.difficulties.length;

        return (
          <div className="flex flex-col items-center justify-center h-full">
            <h2 className="text-4xl font-bold mb-8">Stack Overview</h2>
            <div className="grid grid-cols-2 gap-8 mb-8">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Setup Time
                </h3>
                <div className="text-3xl font-bold text-blue-400">{totalTime}h</div>
                <div className="text-slate-400 mt-2">Total estimated time</div>
              </Card>
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  Difficulty
                </h3>
                <div className="text-3xl font-bold text-purple-400">
                  {avgDifficulty < 1.5 ? 'Beginner' : avgDifficulty < 2.5 ? 'Intermediate' : 'Expert'}
                </div>
                <div className="text-slate-400 mt-2">Average complexity</div>
              </Card>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {slide.content.categories.map((category: string) => (
                <Badge key={category} variant="default" size="lg" className="text-lg px-4 py-2">
                  {categoryIcons[category] || '📦'} {category}
                </Badge>
              ))}
            </div>
          </div>
        );

      case 'technology':
        const tech = slide.content as NodeData;
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-6xl mb-6">{categoryIcons[tech.category] || '📦'}</div>
            <h2 className="text-4xl font-bold mb-4">{tech.name}</h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl text-center">{tech.description}</p>
            <div className="grid grid-cols-3 gap-6">
              <Card className="p-4 text-center">
                <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-400" />
                <div className="font-semibold">{tech.pricing}</div>
                <div className="text-sm text-slate-400">Pricing</div>
              </Card>
              <Card className="p-4 text-center">
                <Clock className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                <div className="font-semibold">{tech.setupTimeHours}h</div>
                <div className="text-sm text-slate-400">Setup Time</div>
              </Card>
              <Card className="p-4 text-center">
                <Target className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                <div className="font-semibold capitalize">{tech.difficulty}</div>
                <div className="text-sm text-slate-400">Difficulty</div>
              </Card>
            </div>
          </div>
        );

      case 'summary':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-4xl font-bold mb-8">Stack Summary</h2>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {slide.content.technologies.slice(0, 6).map((tech: NodeData) => (
                <Card key={tech.id} className="p-4">
                  <div className="text-2xl mb-2">{categoryIcons[tech.category] || '📦'}</div>
                  <div className="font-semibold">{tech.name}</div>
                </Card>
              ))}
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">Key Benefits</h3>
              {slide.content.benefits.map((benefit: string, index: number) => (
                <motion.div 
                  key={index}
                  className="flex items-center gap-3 text-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Zap className="w-5 h-5 text-green-400" />
                  <span>{benefit}</span>
                </motion.div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
          <div className="text-slate-300">
            {currentSlide + 1} / {slides.length}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentSlide(0)}
            className="text-slate-300 hover:text-white"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="text-slate-300 hover:text-white"
          >
            {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Slide Content */}
      <div className="h-full flex items-center justify-center px-8 py-16">
        <AnimatePresence initial={false} custom={direction}>
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
            className="absolute inset-0 flex items-center justify-center px-8 py-16"
          >
            {renderSlideContent(slides[currentSlide])}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-4">
        <Button
          variant="ghost"
          size="lg"
          onClick={() => navigateSlide(-1)}
          disabled={currentSlide === 0}
          className="text-slate-300 hover:text-white disabled:opacity-50"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > currentSlide ? 1 : -1);
                setCurrentSlide(index);
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentSlide 
                  ? "bg-white w-8" 
                  : "bg-slate-600 hover:bg-slate-500"
              )}
            />
          ))}
        </div>
        <Button
          variant="ghost"
          size="lg"
          onClick={() => navigateSlide(1)}
          disabled={currentSlide === slides.length - 1}
          className="text-slate-300 hover:text-white disabled:opacity-50"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
};