'use client';

import { notFound } from 'next/navigation';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StackPreview } from '@/components/ui/StackPreview';
import { getStackBySlug, trackStackUsage, StackWithDetails } from '@/lib/supabase/stacks';
import { useUser } from '@/lib/hooks/useUser';
import { 
  ArrowLeft,
  Star,
  Users,
  Clock,
  Download,
  Share2,
  Copy,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Info,
  Play,
  Code2,
  Zap,
  Award,
  Calendar,
  TrendingUp,
  Shield,
  Gauge,
  DollarSign,
  BookOpen,
  GitBranch
} from 'lucide-react';

interface StackDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function StackDetailPage({ params }: StackDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useUser();
  const [stack, setStack] = useState<StackWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStack() {
      const stackData = await getStackBySlug(id);
      if (!stackData) {
        notFound();
      }
      setStack(stackData);
      setLoading(false);
    }
    loadStack();
  }, [id]);

  const handleStartBuilding = async () => {
    if (stack) {
      // Track the usage
      await trackStackUsage(stack.id, user?.id);
      // Navigate to builder with preset
      router.push(`/builder?preset=${stack.slug}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!stack) {
    notFound();
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'expert': return 'danger';
      default: return 'default';
    }
  };

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'free': return 'success';
      case 'freemium': return 'info';
      case 'paid': return 'warning';
      case 'mixed': return 'secondary';
      default: return 'default';
    }
  };

  const getTechnologyIcon = (techName: string) => {
    const iconMap: { [key: string]: string } = {
      'Next.js': '▲',
      'React': '⚛️', 
      'Vue.js': '💚',
      'Node.js': '🟢',
      'TypeScript': '🔷',
      'JavaScript': '💛',
      'Python': '🐍',
      'PostgreSQL': '🐘',
      'MongoDB': '🍃',
      'Redis': '🔴',
      'Docker': '🐳',
      'Kubernetes': '☸️',
      'AWS': '☁️',
      'Vercel': '▲',
      'Netlify': '🌐',
      'Supabase': '⚡',
      'Firebase': '🔥',
      'Stripe': '💳',
      'Tailwind CSS': '🎨',
      'GraphQL': '◇',
      'FastAPI': '⚡',
      'Express': '🚂',
      'Prisma': '🔶',
      'Shopify API': '🛒'
    };
    return iconMap[techName] || '🔧';
  };

  const getCategoryGradient = (category: string) => {
    const gradients: { [key: string]: string } = {
      'Full-stack': 'from-blue-500 to-purple-600',
      'AI/ML': 'from-green-500 to-teal-600',
      'Rapid Development': 'from-yellow-500 to-orange-600',
      'E-commerce': 'from-pink-500 to-red-600',
      'Mobile': 'from-indigo-500 to-blue-600',
      'Real-time': 'from-purple-500 to-pink-600',
      'Content': 'from-teal-500 to-cyan-600',
      'Enterprise': 'from-slate-500 to-gray-600',
      'Microservices': 'from-emerald-500 to-green-600',
      'Data Science': 'from-violet-500 to-purple-600'
    };
    return gradients[category] || 'from-blue-500 to-purple-600';
  };

  return (
    <div className="min-h-screen bg-slate-950 relative">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle, rgba(59, 130, 246, 0.03) 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
          }}
        />
      </div>

      <div className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Enhanced Back Button */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link href="/stacks">
              <Button variant="ghost" className="gap-2 hover:bg-slate-800/50 text-slate-400 hover:text-white transition-all">
                <ArrowLeft className="h-4 w-4" />
                Back to Stack Library
              </Button>
            </Link>
          </motion.div>

          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative mb-12"
          >
            {/* Hero Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 to-slate-800/30 rounded-3xl blur" />
            <div className={`absolute inset-0 bg-gradient-to-r ${getCategoryGradient(stack.category)}/10 rounded-3xl`} />
            
            <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-8 lg:p-12">
              {/* Category & Badges */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Badge 
                  variant="primary" 
                  className={`bg-gradient-to-r ${getCategoryGradient(stack.category)} text-white border-0 text-sm px-4 py-2`}
                >
                  {stack.category}
                </Badge>
                <Badge variant={getDifficultyColor(stack.difficulty)} outline className="text-sm px-3 py-1">
                  {stack.difficulty} level
                </Badge>
                <Badge variant={getPricingColor(stack.pricing)} outline className="text-sm px-3 py-1">
                  {stack.pricing}
                </Badge>
              </div>
              
              {/* Title & Description */}
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {stack.name}
              </h1>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-4xl">
                {stack.description}
              </p>
              
              {/* Enhanced Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <Star className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stack.rating.toFixed(1)}</p>
                      <p className="text-sm text-slate-400">Rating</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stack.usage_count.toLocaleString()}</p>
                      <p className="text-sm text-slate-400">Uses</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stack.setup_time_hours}h</p>
                      <p className="text-sm text-slate-400">Setup</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Award className="h-5 w-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stack.technologies.length}</p>
                      <p className="text-sm text-slate-400">Technologies</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Author & Date */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <span>Created by</span>
                  <span className="text-slate-300 font-medium">{stack.author}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(stack.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">

              {/* Stack Architecture Preview - Removed as it's not representative */}

              {/* Enhanced Technologies */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <Card variant="glass" className="border-slate-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Code2 className="h-4 w-4 text-green-400" />
                      </div>
                      Technology Stack
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {['primary', 'secondary', 'optional'].map(role => {
                        const roleTechs = stack.technologies.filter(t => t.role === role);
                        if (roleTechs.length === 0) return null;
                        
                        const roleColors = {
                          primary: 'bg-blue-500',
                          secondary: 'bg-purple-500', 
                          optional: 'bg-slate-600'
                        };
                        
                        const roleLabels = {
                          primary: 'Core',
                          secondary: 'Supporting', 
                          optional: 'Optional'
                        };
                        
                        return (
                          <div key={role}>
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`w-3 h-3 rounded-full ${roleColors[role as keyof typeof roleColors]}`} />
                              <h4 className="text-lg font-semibold text-slate-200">
                                {roleLabels[role as keyof typeof roleLabels]} Technologies
                              </h4>
                              <Badge variant="secondary" size="sm" className="ml-auto bg-slate-700">
                                {roleTechs.length}
                              </Badge>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                              {roleTechs.map(tech => (
                                <div key={tech.id} className="group">
                                  <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative flex items-center gap-4 rounded-xl bg-slate-800/30 border border-slate-700/50 p-4 group-hover:border-slate-600/50 transition-all">
                                      <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center text-xl border border-slate-600">
                                        {getTechnologyIcon(tech.name)}
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-semibold text-slate-200 mb-1">{tech.technology_name}</p>
                                        <div className="flex items-center gap-2">
                                          <Badge 
                                            variant="secondary" 
                                            size="sm"
                                            className="bg-slate-700/50 text-slate-400 text-xs"
                                          >
                                            {tech.category}
                                          </Badge>
                                          <Badge 
                                            variant="secondary" 
                                            size="sm"
                                            className={`${roleColors[role as keyof typeof roleColors]}/20 text-xs border ${roleColors[role as keyof typeof roleColors]}/30`}
                                          >
                                            {roleLabels[role as keyof typeof roleLabels]}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Enhanced Use Cases */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Card variant="glass" className="border-slate-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-purple-400" />
                      </div>
                      Perfect for These Use Cases
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {stack.use_cases.map((useCase, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index, duration: 0.4 }}
                          className="group"
                        >
                          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 group-hover:border-green-500/30 group-hover:bg-green-500/5 transition-all">
                            <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-400" />
                            <span className="text-slate-300 font-medium">{useCase}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Enhanced Pros and Cons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="grid gap-6 md:grid-cols-2"
              >
                <Card variant="glass" className="border-slate-800 hover:border-green-500/30 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-green-400 text-xl">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      Advantages
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {stack.pros.map((pro, index) => (
                        <motion.li 
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index, duration: 0.3 }}
                          className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20"
                        >
                          <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0 mt-2" />
                          <span className="text-slate-300 leading-relaxed">{pro}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card variant="glass" className="border-slate-800 hover:border-red-500/30 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-red-400 text-xl">
                      <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      Considerations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {stack.cons.map((con, index) => (
                        <motion.li 
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index, duration: 0.3 }}
                          className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20"
                        >
                          <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0 mt-2" />
                          <span className="text-slate-300 leading-relaxed">{con}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Enhanced Installation Steps */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <Card variant="glass" className="border-slate-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-cyan-400" />
                      </div>
                      Step-by-Step Setup Guide
                    </CardTitle>
                    <p className="text-slate-400 mt-2">
                      Estimated setup time: <span className="text-cyan-400 font-medium">{stack.setup_time_hours} hours</span>
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {stack.installation_steps.map((step, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index, duration: 0.4 }}
                          className="group relative"
                        >
                          {index !== stack.installation_steps.length - 1 && (
                            <div className="absolute left-4 top-10 bottom-0 w-px bg-gradient-to-b from-cyan-400/50 to-transparent" />
                          )}
                          <div className="flex gap-4 p-4 rounded-xl bg-slate-800/20 border border-slate-700/50 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/5 transition-all">
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-bold text-white shadow-lg">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-slate-200 font-medium leading-relaxed">{step}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Alternatives section removed as requested */}
          </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-6">
              {/* Primary Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <Card variant="glass" className="border-slate-800">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <Button 
                        variant="primary" 
                        size="lg" 
                        className="w-full h-14 text-base font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-lg"
                        onClick={handleStartBuilding}
                      >
                        <Play className="mr-3 h-5 w-5" />
                        Start Building Now
                      </Button>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="secondary" size="sm" className="h-12">
                          <Download className="mr-2 h-4 w-4" />
                          Export Config
                        </Button>
                        <Button variant="secondary" size="sm" className="h-12">
                          <Share2 className="mr-2 h-4 w-4" />
                          Share Stack
                        </Button>
                      </div>
                      
                      <Button variant="ghost" className="w-full h-10 text-sm">
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Stack ID: {stack.slug}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Enhanced Stack Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
              >
                <Card variant="glass" className="border-slate-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-slate-700 rounded-lg flex items-center justify-center">
                        <Gauge className="h-3 w-3 text-slate-400" />
                      </div>
                      Stack Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple-400" />
                          <span className="text-slate-400">Setup Time</span>
                        </div>
                        <span className="font-semibold text-slate-200">{stack.setup_time_hours}h</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-400" />
                          <span className="text-slate-400">Difficulty</span>
                        </div>
                        <Badge variant={getDifficultyColor(stack.difficulty)} size="sm">
                          {stack.difficulty}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-400" />
                          <span className="text-slate-400">Pricing</span>
                        </div>
                        <Badge variant={getPricingColor(stack.pricing)} size="sm">
                          {stack.pricing}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-400" />
                          <span className="text-slate-400">Rating</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-slate-200">{stack.rating.toFixed(1)}</span>
                          <span className="text-slate-400">/5</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-400" />
                          <span className="text-slate-400">Community Uses</span>
                        </div>
                        <span className="font-semibold text-slate-200">{stack.usage_count.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Enhanced Tips & Security */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0, duration: 0.6 }}
              >
                <Card variant="glass" className="border-slate-800">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 flex-shrink-0 text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-semibold text-slate-200 mb-2">Pro Tips</p>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            Follow the installation steps in order. Each component depends on the previous setup.
                          </p>
                        </div>
                      </div>
                      
                      <div className="border-t border-slate-800 pt-4">
                        <div className="flex items-start gap-3">
                          <Shield className="h-5 w-5 flex-shrink-0 text-green-400 mt-0.5" />
                          <div>
                            <p className="font-semibold text-slate-200 mb-2">Security Notes</p>
                            <p className="text-sm text-slate-400 leading-relaxed">
                              This stack follows industry security best practices. Review configuration before production use.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Related stacks section removed - showing alternatives in sidebar is enough */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}