'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { 
  X, 
  Plus,
  Container,
  Package,
  Layers,
  Server,
  Database,
  GitBranch,
  Smartphone,
  Brain,
  Wrench,
  Box,
  Globe,
  ExternalLink,
  Github,
  FileText,
  Tag,
  DollarSign,
  Clock,
  Gauge,
  Sparkles,
  Check,
  AlertTriangle,
  Star,
  Users,
  ChevronRight
} from 'lucide-react';
import type { ResourceStats } from '@/lib/types/stack';

type CategoryType = 'frontend' | 'backend' | 'database' | 'devops' | 'mobile' | 'ai' | 'infrastructure' | 'other';
type DifficultyType = 'beginner' | 'intermediate' | 'expert';
type PricingType = 'free' | 'freemium' | 'paid';

interface ComponentSubmissionFormData {
  // Informations de base
  name: string;
  description: string;
  category: CategoryType;
  
  // Type et configuration
  type: 'component' | 'container';
  containerType?: 'docker' | 'kubernetes';
  difficulty: DifficultyType;
  pricing: PricingType;
  setupTimeHours: number;
  
  // Documentation et liens
  documentation?: string;
  officialDocsUrl?: string;
  githubUrl?: string;
  logoUrl?: string;
  
  // Métadonnées
  tags: string[];
  compatibleWith: string[];
  
  // Pour les containers
  containedTechnologies?: string[];
  
  // Ressources système
  resources?: ResourceStats;
  
  // Informations d'usage estimées (optionnelles)
  estimatedUsageCount?: number;
  isOpenSource?: boolean;
}

interface ComponentSubmissionModalProps {
  onClose: () => void;
  onSubmit: (data: ComponentSubmissionFormData) => Promise<void>;
}

const categoryConfig = {
  frontend: { label: 'Frontend', icon: Layers, color: 'blue' },
  backend: { label: 'Backend', icon: Server, color: 'green' },
  database: { label: 'Database', icon: Database, color: 'purple' },
  devops: { label: 'DevOps', icon: GitBranch, color: 'orange' },
  mobile: { label: 'Mobile', icon: Smartphone, color: 'pink' },
  ai: { label: 'AI/ML', icon: Brain, color: 'yellow' },
  infrastructure: { label: 'Infrastructure', icon: Box, color: 'cyan' },
  other: { label: 'Autre', icon: Wrench, color: 'gray' }
};

export function ComponentSubmissionModal({ onClose, onSubmit }: ComponentSubmissionModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newCompatible, setNewCompatible] = useState('');
  const [newContainedTech, setNewContainedTech] = useState('');
  
  const [formData, setFormData] = useState<ComponentSubmissionFormData>({
    name: '',
    description: '',
    category: 'frontend',
    type: 'component',
    difficulty: 'intermediate',
    pricing: 'free',
    setupTimeHours: 1,
    tags: [],
    compatibleWith: [],
    resources: {
      cpu: '1 core',
      memory: '512MB'
    },
    estimatedUsageCount: 0,
    isOpenSource: true
  });

  const updateFormData = useCallback((updates: Partial<ComponentSubmissionFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      updateFormData({ tags: [...formData.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    updateFormData({ tags: formData.tags.filter(t => t !== tag) });
  };

  const addCompatible = () => {
    if (newCompatible.trim() && !formData.compatibleWith.includes(newCompatible.trim())) {
      updateFormData({ compatibleWith: [...formData.compatibleWith, newCompatible.trim()] });
      setNewCompatible('');
    }
  };

  const removeCompatible = (tech: string) => {
    updateFormData({ compatibleWith: formData.compatibleWith.filter(t => t !== tech) });
  };

  const addContainedTech = () => {
    if (newContainedTech.trim() && !formData.containedTechnologies?.includes(newContainedTech.trim())) {
      updateFormData({ 
        containedTechnologies: [...(formData.containedTechnologies || []), newContainedTech.trim()] 
      });
      setNewContainedTech('');
    }
  };

  const removeContainedTech = (tech: string) => {
    updateFormData({ 
      containedTechnologies: formData.containedTechnologies?.filter(t => t !== tech) 
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToStep2 = formData.name.trim() && formData.description.trim() && formData.category;
  const canSubmit = canProceedToStep2 && formData.setupTimeHours > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Proposer un {formData.type === 'container' ? 'Container' : 'Composant'}
            </h2>
            <p className="text-gray-400 mt-1">
              Partagez votre {formData.type === 'container' ? 'container' : 'composant'} avec la communauté
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-400'
              }`}>
                1
              </div>
              <span className="text-sm font-medium">Informations de base</span>
            </div>
            <div className={`flex-1 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-700'}`} />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-700 text-gray-400'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Configuration avancée</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {step === 1 && (
            <div className="space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Type de contribution
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Card 
                    className={`cursor-pointer transition-all ${
                      formData.type === 'component' 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                    onClick={() => updateFormData({ type: 'component' })}
                  >
                    <CardContent className="p-4 text-center">
                      <Package className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                      <h3 className="font-semibold text-white mb-1">Composant</h3>
                      <p className="text-xs text-gray-400">
                        Service, bibliothèque, ou outil individuel
                      </p>
                    </CardContent>
                  </Card>
                  <Card 
                    className={`cursor-pointer transition-all ${
                      formData.type === 'container' 
                        ? 'border-purple-500 bg-purple-500/10' 
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                    onClick={() => updateFormData({ type: 'container' })}
                  >
                    <CardContent className="p-4 text-center">
                      <Container className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                      <h3 className="font-semibold text-white mb-1">Container</h3>
                      <p className="text-xs text-gray-400">
                        Docker ou Kubernetes avec plusieurs services
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Container Type */}
              {formData.type === 'container' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Type de container
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {['docker', 'kubernetes'].map((type) => (
                      <button
                        key={type}
                        onClick={() => updateFormData({ containerType: type as 'docker' | 'kubernetes' })}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          formData.containerType === type
                            ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                            : 'border-slate-700 hover:border-slate-600 text-gray-300'
                        }`}
                      >
                        <div className="font-medium capitalize">{type}</div>
                        <div className="text-sm text-gray-400">
                          {type === 'docker' ? 'Docker Compose' : 'Kubernetes Pod/Deployment'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateFormData({ name: e.target.value })}
                    placeholder="ex: React Query, Docker LAMP Stack..."
                    className="bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Catégorie *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateFormData({ category: e.target.value as CategoryType })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                    required
                  >
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  placeholder="Décrivez votre composant/container, ses avantages et cas d'usage..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white h-24 resize-none"
                  required
                />
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Gauge className="w-4 h-4 inline mr-1" />
                    Difficulté
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => updateFormData({ difficulty: e.target.value as DifficultyType })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="beginner">Débutant</option>
                    <option value="intermediate">Intermédiaire</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Prix
                  </label>
                  <select
                    value={formData.pricing}
                    onChange={(e) => updateFormData({ pricing: e.target.value as PricingType })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="free">Gratuit</option>
                    <option value="freemium">Freemium</option>
                    <option value="paid">Payant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Setup (heures)
                  </label>
                  <Input
                    type="number"
                    min="0.5"
                    max="100"
                    step="0.5"
                    value={formData.setupTimeHours}
                    onChange={(e) => updateFormData({ setupTimeHours: parseFloat(e.target.value) || 1 })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Documentation */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Documentation
                </label>
                <textarea
                  value={formData.documentation || ''}
                  onChange={(e) => updateFormData({ documentation: e.target.value })}
                  placeholder="Documentation détaillée en Markdown..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white h-32 resize-none"
                />
              </div>

              {/* URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <ExternalLink className="w-4 h-4 inline mr-1" />
                    Documentation officielle
                  </label>
                  <Input
                    type="url"
                    value={formData.officialDocsUrl || ''}
                    onChange={(e) => updateFormData({ officialDocsUrl: e.target.value })}
                    placeholder="https://example.com/docs"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Github className="w-4 h-4 inline mr-1" />
                    GitHub
                  </label>
                  <Input
                    type="url"
                    value={formData.githubUrl || ''}
                    onChange={(e) => updateFormData({ githubUrl: e.target.value })}
                    placeholder="https://github.com/user/repo"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  URL du logo
                </label>
                <Input
                  type="url"
                  value={formData.logoUrl || ''}
                  onChange={(e) => updateFormData({ logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.svg"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Ajouter un tag..."
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                  <Button onClick={addTag} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} className="border border-slate-600 bg-transparent">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Compatible With */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Check className="w-4 h-4 inline mr-1" />
                  Compatible avec
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    type="text"
                    value={newCompatible}
                    onChange={(e) => setNewCompatible(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCompatible())}
                    placeholder="ex: React, Next.js, PostgreSQL..."
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                  <Button onClick={addCompatible} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.compatibleWith.map((tech) => (
                    <Badge key={tech} className="border border-green-600 text-green-400 bg-transparent">
                      {tech}
                      <button
                        onClick={() => removeCompatible(tech)}
                        className="ml-1 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Container Technologies */}
              {formData.type === 'container' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Container className="w-4 h-4 inline mr-1" />
                    Technologies contenues
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      type="text"
                      value={newContainedTech}
                      onChange={(e) => setNewContainedTech(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addContainedTech())}
                      placeholder="ex: Nginx, Redis, PostgreSQL..."
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                    <Button onClick={addContainedTech} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.containedTechnologies?.map((tech) => (
                      <Badge key={tech} className="border border-purple-600 text-purple-400 bg-transparent">
                        {tech}
                        <button
                          onClick={() => removeContainedTech(tech)}
                          className="ml-1 hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Resource Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Ressources système recommandées
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">CPU</label>
                    <Input
                      type="text"
                      value={formData.resources?.cpu || ''}
                      onChange={(e) => updateFormData({ 
                        resources: { ...formData.resources!, cpu: e.target.value }
                      })}
                      placeholder="ex: 1 core, 500m"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Mémoire</label>
                    <Input
                      type="text"
                      value={formData.resources?.memory || ''}
                      onChange={(e) => updateFormData({ 
                        resources: { ...formData.resources!, memory: e.target.value }
                      })}
                      placeholder="ex: 512MB, 2GB"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Usage estimé (optionnel)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.estimatedUsageCount || 0}
                    onChange={(e) => updateFormData({ estimatedUsageCount: parseInt(e.target.value) || 0 })}
                    placeholder="Nombre d'utilisations estimées"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">Sera utilisé comme valeur de départ</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Type de projet
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isOpenSource}
                        onChange={(e) => updateFormData({ isOpenSource: e.target.checked })}
                        className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-300">Open Source</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Preview Section */}
              <div className="mt-8 pt-6 border-t border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-blue-400" />
                  Aperçu de votre {formData.type === 'container' ? 'container' : 'composant'}
                </h3>
                <ComponentPreviewCard formData={formData} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700">
          <div className="text-sm text-gray-400">
            {step === 1 && !canProceedToStep2 && (
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                Veuillez remplir les champs obligatoires
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            {step === 2 && (
              <Button
                variant="secondary"
                onClick={() => setStep(1)}
              >
                Précédent
              </Button>
            )}
            
            {step === 1 ? (
              <Button
                onClick={() => setStep(2)}
                disabled={!canProceedToStep2}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Suivant
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-5 h-5 mr-2" />
                )}
                {isSubmitting ? 'Envoi...' : 'Soumettre'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Component Preview Card
function ComponentPreviewCard({ formData }: { formData: ComponentSubmissionFormData }) {
  const config = categoryConfig[formData.category];
  const Icon = config.icon;
  
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

  if (!formData.name || !formData.description) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Package className="w-12 h-12 mx-auto mb-2" />
        <p>Remplissez le nom et la description pour voir l&apos;aperçu</p>
      </div>
    );
  }

  return (
    <Card className="group relative bg-slate-900/50 backdrop-blur-sm border-slate-800 overflow-hidden max-w-sm">
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br from-${config.color}-500 to-${config.color}-600 opacity-5`} />
      
      <CardContent className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-${config.color}-500/10 border border-${config.color}-500/20`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">
                {formData.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="text-xs border border-slate-600 bg-transparent">
                  {formData.type === 'container' ? (
                    <>
                      <Container className="w-3 h-3 mr-1" />
                      Container
                    </>
                  ) : (
                    <>
                      <Package className="w-3 h-3 mr-1" />
                      Component
                    </>
                  )}
                </Badge>
                <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30 text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Nouveau
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Like button */}
          <button className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
            <Star className="w-5 h-5 text-gray-500 hover:text-yellow-400" />
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {formData.description}
        </p>

        {/* Metadata */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Gauge className="w-3 h-3" />
            <span className={getDifficultyColor(formData.difficulty)}>
              {formData.difficulty === 'beginner' ? 'Débutant' : 
               formData.difficulty === 'intermediate' ? 'Intermédiaire' : 'Expert'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{formData.setupTimeHours}h setup</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <DollarSign className="w-3 h-3" />
            <span className={getPricingColor(formData.pricing)}>
              {formData.pricing === 'free' ? 'Gratuit' : 
               formData.pricing === 'freemium' ? 'Freemium' : 'Payant'}
            </span>
          </div>
        </div>

        {/* Container Technologies */}
        {formData.type === 'container' && formData.containedTechnologies && formData.containedTechnologies.length > 0 && (
          <div className="mb-4">
            <div className="text-xs text-gray-500 mb-2">Contient:</div>
            <div className="flex flex-wrap gap-1">
              {formData.containedTechnologies.slice(0, 3).map((tech) => (
                <Badge 
                  key={tech} 
                  className="text-xs border border-slate-700 bg-transparent"
                >
                  {tech}
                </Badge>
              ))}
              {formData.containedTechnologies.length > 3 && (
                <Badge className="text-xs border border-slate-700 bg-transparent text-gray-500">
                  +{formData.containedTechnologies.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="w-3 h-3 text-yellow-500" />
              <span>5.0</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Star className="w-3 h-3 text-yellow-500" />
              <span>0</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="w-3 h-3" />
              <span>{formatNumber(formData.estimatedUsageCount || 0)}</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-500" />
        </div>
      </CardContent>
    </Card>
  );
}