'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { 
  X,
  Star,
  ExternalLink,
  Github,
  FileText,
  Users,
  Clock,
  DollarSign,
  Gauge,
  Container,
  Package,
  CheckCircle,
  Info,
  Layers,
  Server,
  Database,
  GitBranch,
  Smartphone,
  Brain,
  Wrench,
  Box,
  Sparkles,
  Copy,
  BookOpen
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

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
  containedTechnologies?: string[];
  resourceRequirements?: {
    cpu?: string;
    memory?: string;
    storage?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ComponentDetailModalProps {
  component: CommunityComponent;
  onClose: () => void;
  onAddToBuilder?: () => void;
}

const categoryConfig = {
  frontend: { label: 'Frontend', icon: Layers, color: 'from-blue-500 to-blue-600' },
  backend: { label: 'Backend', icon: Server, color: 'from-green-500 to-green-600' },
  database: { label: 'Database', icon: Database, color: 'from-purple-500 to-purple-600' },
  devops: { label: 'DevOps', icon: GitBranch, color: 'from-orange-500 to-orange-600' },
  mobile: { label: 'Mobile', icon: Smartphone, color: 'from-pink-500 to-pink-600' },
  ai: { label: 'AI/ML', icon: Brain, color: 'from-yellow-500 to-yellow-600' },
  infrastructure: { label: 'Infrastructure', icon: Box, color: 'from-cyan-500 to-cyan-600' },
  other: { label: 'Autre', icon: Wrench, color: 'from-gray-500 to-gray-600' }
};

export function ComponentDetailModal({ component, onClose }: ComponentDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'documentation' | 'resources'>('overview');
  
  const config = categoryConfig[component.category];
  const Icon = config.icon;

  const copyInstallCommand = () => {
    const command = component.type === 'container' 
      ? `docker pull ${component.name.toLowerCase().replace(/\s+/g, '-')}`
      : `npm install ${component.name.toLowerCase().replace(/\s+/g, '-')}`;
    
    navigator.clipboard.writeText(command);
    // TODO: Afficher une notification de succès
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'expert': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'free': return 'text-green-400';
      case 'freemium': return 'text-yellow-400';
      case 'paid': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-r ${config.color} opacity-10`} />
          <div className="relative p-6 border-b border-slate-700">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${config.color} shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-3xl font-bold text-white">{component.name}</h2>
                    {component.isOfficial && (
                      <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Officiel
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-400 text-lg mb-3">{component.description}</p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className="border border-slate-600 bg-transparent">
                      {component.type === 'container' ? (
                        <>
                          <Container className="w-3 h-3 mr-1" />
                          {component.containerType === 'docker' ? 'Docker' : 'Kubernetes'}
                        </>
                      ) : (
                        <>
                          <Package className="w-3 h-3 mr-1" />
                          Component
                        </>
                      )}
                    </Badge>
                    <Badge className="border border-slate-600 bg-transparent">
                      {config.label}
                    </Badge>
                    {component.tags.map((tag) => (
                      <Badge key={tag} className="border border-slate-600 bg-transparent text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-white font-semibold">{component.rating}</span>
                <span className="text-gray-400 text-sm">({component.reviewCount} avis)</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-white">{formatNumber(component.usageCount)}</span>
                <span className="text-gray-400 text-sm">utilisations</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-white">{formatNumber(component.likesCount)}</span>
                <span className="text-gray-400 text-sm">likes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-slate-700">
          <div className="flex gap-1">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: Info },
              { id: 'documentation', label: 'Documentation', icon: BookOpen },
              { id: 'resources', label: 'Ressources', icon: Sparkles }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'documentation' | 'resources')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-b-2 border-blue-500 bg-slate-800/50'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4 text-center">
                    <Gauge className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                    <div className="text-sm text-gray-400">Difficulté</div>
                    <div className={`font-semibold ${getDifficultyColor(component.difficulty)}`}>
                      {component.difficulty === 'beginner' ? 'Débutant' : 
                       component.difficulty === 'intermediate' ? 'Intermédiaire' : 'Expert'}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4 text-center">
                    <Clock className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                    <div className="text-sm text-gray-400">Setup</div>
                    <div className="font-semibold text-white">{component.setupTimeHours}h</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4 text-center">
                    <DollarSign className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                    <div className="text-sm text-gray-400">Prix</div>
                    <div className={`font-semibold ${getPricingColor(component.pricing)}`}>
                      {component.pricing === 'free' ? 'Gratuit' : 
                       component.pricing === 'freemium' ? 'Freemium' : 'Payant'}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4 text-center">
                    <Users className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                    <div className="text-sm text-gray-400">Auteur</div>
                    <div className="font-semibold text-white truncate">{component.author.name}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Container Technologies */}
              {component.type === 'container' && component.containedTechnologies && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Technologies incluses</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {component.containedTechnologies.map((tech) => (
                      <Badge 
                        key={tech} 
                        className="border border-purple-600/30 text-purple-400 justify-center py-2 bg-transparent"
                      >
                        <Container className="w-3 h-3 mr-1" />
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Compatibility */}
              {component.compatibleWith && component.compatibleWith.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Compatible avec</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {component.compatibleWith.map((tech) => (
                      <Badge 
                        key={tech} 
                        className="border border-green-600/30 text-green-400 justify-center py-2 bg-transparent"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Liens utiles</h3>
                <div className="flex flex-wrap gap-3">
                  {component.officialDocsUrl && (
                    <a
                      href={component.officialDocsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="text-white">Documentation</span>
                    </a>
                  )}
                  {component.githubUrl && (
                    <a
                      href={component.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <Github className="w-4 h-4" />
                      <span className="text-white">GitHub</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documentation' && (
            <div className="prose prose-invert max-w-none">
              {component.documentation ? (
                <div className="text-gray-300">
                  <ReactMarkdown>
                    {component.documentation}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Aucune documentation disponible</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="space-y-6">
              {component.resourceRequirements && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Ressources recommandées</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {component.resourceRequirements.cpu && (
                      <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm text-gray-400">CPU</span>
                          </div>
                          <div className="text-lg font-semibold text-white">
                            {component.resourceRequirements.cpu}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {component.resourceRequirements.memory && (
                      <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-gray-400">Mémoire</span>
                          </div>
                          <div className="text-lg font-semibold text-white">
                            {component.resourceRequirements.memory}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {component.resourceRequirements.storage && (
                      <Card className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-sm text-gray-400">Stockage</span>
                          </div>
                          <div className="text-lg font-semibold text-white">
                            {component.resourceRequirements.storage}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {/* Installation Instructions */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Installation</h3>
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Commande d&apos;installation</span>
                      <Button variant="ghost" size="sm" onClick={copyInstallCommand}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <code className="block bg-slate-900 p-3 rounded text-green-400 text-sm">
                      {component.type === 'container' 
                        ? `docker pull ${component.name.toLowerCase().replace(/\s+/g, '-')}`
                        : `npm install ${component.name.toLowerCase().replace(/\s+/g, '-')}`
                      }
                    </code>
                  </CardContent>
                </Card>
              </div>

              {/* Usage Stats */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Statistiques d&apos;usage</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-400">{formatNumber(component.usageCount)}</div>
                      <div className="text-sm text-gray-400">Utilisations</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-400">{formatNumber(component.likesCount)}</div>
                      <div className="text-sm text-gray-400">Likes</div>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-400">{component.rating}</div>
                      <div className="text-sm text-gray-400">Note moyenne</div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}