'use client';

import { useState, useCallback } from 'react';
import { X, Plus, Box, Layers, Server, Cloud, Trash2, Info, Palette } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { NodeData, ResourceStats } from './CanvasNode';

export interface ContainerTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  defaultResources: ResourceStats;
  defaultPorts: string[];
  environmentVariables: Record<string, string>;
  category: 'orchestration' | 'runtime' | 'serverless' | 'custom';
}

interface CustomContainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateContainer: (template: ContainerTemplate, customName?: string) => void;
  sourceNode?: NodeData;
}

const containerTemplates: ContainerTemplate[] = [
  {
    id: 'docker',
    name: 'Docker Container',
    description: 'Conteneur Docker standard pour applications',
    icon: <Box className="h-5 w-5" />,
    color: 'text-blue-400',
    defaultResources: { cpu: '1 core', memory: '512MB', storage: '1GB' },
    defaultPorts: ['3000'],
    environmentVariables: {
      'DOCKER_HOST': 'unix:///var/run/docker.sock'
    },
    category: 'runtime'
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes Pod',
    description: 'Pod Kubernetes avec orchestration',
    icon: <Layers className="h-5 w-5" />,
    color: 'text-green-400',
    defaultResources: { cpu: '0.5 cores', memory: '256MB', storage: '500MB' },
    defaultPorts: ['80', '443'],
    environmentVariables: {
      'KUBERNETES_SERVICE_HOST': 'kubernetes.default.svc',
      'KUBERNETES_SERVICE_PORT': '443'
    },
    category: 'orchestration'
  },
  {
    id: 'podman',
    name: 'Podman Container',
    description: 'Alternative à Docker sans daemon',
    icon: <Box className="h-5 w-5" />,
    color: 'text-purple-400',
    defaultResources: { cpu: '1 core', memory: '512MB', storage: '1GB' },
    defaultPorts: ['8080'],
    environmentVariables: {
      'PODMAN_USERNS': 'keep-id'
    },
    category: 'runtime'
  },
  {
    id: 'containerd',
    name: 'containerd',
    description: 'Runtime de conteneurs industriel',
    icon: <Server className="h-5 w-5" />,
    color: 'text-orange-400',
    defaultResources: { cpu: '0.5 cores', memory: '256MB', storage: '512MB' },
    defaultPorts: [],
    environmentVariables: {
      'CONTAINERD_SNAPSHOTTER': 'overlayfs'
    },
    category: 'runtime'
  },
  {
    id: 'lambda',
    name: 'AWS Lambda',
    description: 'Fonction serverless AWS',
    icon: <Cloud className="h-5 w-5" />,
    color: 'text-yellow-400',
    defaultResources: { cpu: '0.25 cores', memory: '128MB' },
    defaultPorts: [],
    environmentVariables: {
      'AWS_REGION': 'us-east-1',
      'AWS_LAMBDA_RUNTIME_API': '127.0.0.1:9001'
    },
    category: 'serverless'
  },
  {
    id: 'cloud-run',
    name: 'Google Cloud Run',
    description: 'Conteneurs serverless Google Cloud',
    icon: <Cloud className="h-5 w-5" />,
    color: 'text-blue-500',
    defaultResources: { cpu: '1 core', memory: '512MB' },
    defaultPorts: ['8080'],
    environmentVariables: {
      'PORT': '8080',
      'GOOGLE_CLOUD_PROJECT': 'my-project'
    },
    category: 'serverless'
  },
  {
    id: 'azure-container',
    name: 'Azure Container Instance',
    description: 'Conteneurs à la demande Azure',
    icon: <Cloud className="h-5 w-5" />,
    color: 'text-cyan-400',
    defaultResources: { cpu: '1 core', memory: '1GB', storage: '1GB' },
    defaultPorts: ['80'],
    environmentVariables: {
      'AZURE_CLIENT_ID': '',
      'AZURE_TENANT_ID': ''
    },
    category: 'serverless'
  }
];

export const CustomContainerModal: React.FC<CustomContainerModalProps> = ({
  isOpen,
  onClose,
  onCreateContainer,
  sourceNode
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ContainerTemplate | null>(null);
  const [customName, setCustomName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCustomTemplate, setShowCustomTemplate] = useState(false);

  const categories = [
    { id: 'all', name: 'Tous', icon: '📦' },
    { id: 'runtime', name: 'Runtime', icon: '⚙️' },
    { id: 'orchestration', name: 'Orchestration', icon: '🎛️' },
    { id: 'serverless', name: 'Serverless', icon: '☁️' },
    { id: 'custom', name: 'Personnalisé', icon: '🛠️' }
  ];

  const filteredTemplates = containerTemplates.filter(template => 
    selectedCategory === 'all' || template.category === selectedCategory
  );

  const handleCreateContainer = useCallback(() => {
    if (selectedTemplate) {
      const finalName = customName.trim() || 
        (sourceNode ? `${sourceNode.name} Container` : selectedTemplate.name);
      
      onCreateContainer(selectedTemplate, finalName);
      onClose();
      setSelectedTemplate(null);
      setCustomName('');
    }
  }, [selectedTemplate, customName, sourceNode, onCreateContainer, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              <Box className="h-6 w-6 text-blue-400" />
              Créer un conteneur personnalisé
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {sourceNode ? 
                `Transformer &quot;${sourceNode.name}&quot; en conteneur` : 
                'Choisissez un type de conteneur à créer'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 p-4 border-b border-slate-700/50 bg-slate-800/30">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className={`bg-slate-800/50 border-2 rounded-lg p-4 cursor-pointer transition-all hover:bg-slate-800/70 ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`${template.color}`}>
                    {template.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-200">{template.name}</h3>
                    <Badge variant="secondary" className="text-xs mt-1">
                      {template.category}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-slate-400 mb-3">
                  {template.description}
                </p>
                
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <span>📊 {template.defaultResources.cpu}</span>
                    <span>💾 {template.defaultResources.memory}</span>
                  </div>
                  {template.defaultPorts.length > 0 && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <span>🔌 Ports: {template.defaultPorts.join(', ')}</span>
                    </div>
                  )}
                  <div className="text-slate-500">
                    🔧 {Object.keys(template.environmentVariables).length} variables d'env.
                  </div>
                </div>
              </div>
            ))}
            
            {/* Custom Template Card */}
            <div
              className={`bg-slate-800/50 border-2 border-dashed rounded-lg p-4 cursor-pointer transition-all hover:bg-slate-800/70 ${
                showCustomTemplate
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-slate-600 hover:border-slate-500'
              }`}
              onClick={() => setShowCustomTemplate(true)}
            >
              <div className="flex flex-col items-center justify-center h-full min-h-[150px] gap-3">
                <Plus className="h-8 w-8 text-purple-400" />
                <div className="text-center">
                  <h3 className="font-medium text-slate-200 mb-1">Conteneur personnalisé</h3>
                  <p className="text-sm text-slate-400">
                    Créez votre propre template de conteneur
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Name Input */}
        {selectedTemplate && (
          <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nom du conteneur (optionnel)
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={sourceNode ? `${sourceNode.name} Container` : selectedTemplate.name}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700">
          <div className="text-sm text-slate-400">
            {selectedTemplate ? (
              <span className="flex items-center gap-2">
                <div className={selectedTemplate.color}>
                  {selectedTemplate.icon}
                </div>
                {selectedTemplate.name} sélectionné
              </span>
            ) : (
              'Sélectionnez un type de conteneur'
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleCreateContainer}
              disabled={!selectedTemplate}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
            >
              Créer le conteneur
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};