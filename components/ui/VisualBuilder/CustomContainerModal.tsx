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
  
  // Custom template form state
  const [customTemplate, setCustomTemplate] = useState({
    name: '',
    description: '',
    cpu: '1 core',
    memory: '512MB',
    storage: '1GB',
    ports: '',
    envVars: ''
  });

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
    } else if (showCustomTemplate && customTemplate.name) {
      // Create custom template
      const portsArray = customTemplate.ports
        .split(',')
        .map(p => p.trim())
        .filter(p => p);
        
      const envVarsObject: Record<string, string> = {};
      if (customTemplate.envVars) {
        customTemplate.envVars.split('\n').forEach(line => {
          const [key, value] = line.split('=').map(s => s.trim());
          if (key) {
            envVarsObject[key] = value || '';
          }
        });
      }
      
      const newTemplate: ContainerTemplate = {
        id: 'custom-' + Date.now(),
        name: customTemplate.name,
        description: customTemplate.description || 'Container personnalisé',
        icon: <Box className="h-5 w-5" />,
        color: 'text-purple-400',
        defaultResources: {
          cpu: customTemplate.cpu,
          memory: customTemplate.memory,
          storage: customTemplate.storage
        },
        defaultPorts: portsArray,
        environmentVariables: envVarsObject,
        category: 'custom'
      };
      
      onCreateContainer(newTemplate, customTemplate.name);
      onClose();
      setShowCustomTemplate(false);
      setCustomTemplate({
        name: '',
        description: '',
        cpu: '1 core',
        memory: '512MB',
        storage: '1GB',
        ports: '',
        envVars: ''
      });
    }
  }, [selectedTemplate, customName, sourceNode, onCreateContainer, onClose, showCustomTemplate, customTemplate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-900/95 backdrop-blur-sm rounded-t-xl">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              <Box className="h-6 w-6 text-blue-400" />
              Créer un conteneur personnalisé
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {sourceNode ? 
                `Transformer "${sourceNode.name}" en conteneur` : 
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

        {/* Category Filter - Fixed */}
        <div className="flex items-center gap-2 p-4 border-b border-slate-700/50 bg-slate-800/30">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-6">
            {showCustomTemplate ? (
              /* Custom Template Form */
              <div className="max-w-2xl mx-auto">
                <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-purple-400" />
                  Créer un template personnalisé
                </h3>
                
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Nom du conteneur
                    </label>
                    <input
                      type="text"
                      value={customTemplate.name}
                      onChange={(e) => setCustomTemplate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Mon Container Custom"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={customTemplate.description}
                      onChange={(e) => setCustomTemplate(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description du conteneur..."
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    />
                  </div>
                  
                  {/* Resources */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-3">Ressources</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">CPU</label>
                        <input
                          type="text"
                          value={customTemplate.cpu}
                          onChange={(e) => setCustomTemplate(prev => ({ ...prev, cpu: e.target.value }))}
                          placeholder="1 core"
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Mémoire</label>
                        <input
                          type="text"
                          value={customTemplate.memory}
                          onChange={(e) => setCustomTemplate(prev => ({ ...prev, memory: e.target.value }))}
                          placeholder="512MB"
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Stockage</label>
                        <input
                          type="text"
                          value={customTemplate.storage}
                          onChange={(e) => setCustomTemplate(prev => ({ ...prev, storage: e.target.value }))}
                          placeholder="1GB"
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Ports */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Ports (séparés par des virgules)
                    </label>
                    <input
                      type="text"
                      value={customTemplate.ports}
                      onChange={(e) => setCustomTemplate(prev => ({ ...prev, ports: e.target.value }))}
                      placeholder="80, 443, 3000"
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  
                  {/* Environment Variables */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Variables d&apos;environnement (KEY=value, une par ligne)
                    </label>
                    <textarea
                      value={customTemplate.envVars}
                      onChange={(e) => setCustomTemplate(prev => ({ ...prev, envVars: e.target.value }))}
                      placeholder="NODE_ENV=production\nPORT=3000\nAPI_KEY=your-key"
                      rows={4}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none font-mono text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => {
                      setShowCustomTemplate(false);
                      setCustomTemplate({
                        name: '',
                        description: '',
                        cpu: '1 core',
                        memory: '512MB',
                        storage: '1GB',
                        ports: '',
                        envVars: ''
                      });
                    }}
                    className="px-4 py-2 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors"
                  >
                    Retour aux templates
                  </button>
                </div>
              </div>
            ) : (
              /* Template Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`bg-slate-800/50 border-2 rounded-lg p-4 cursor-pointer transition-all hover:bg-slate-800/70 hover:scale-105 ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
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
                        🔧 {Object.keys(template.environmentVariables).length} variables d&apos;env.
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Custom Template Card */}
                <div
                  className={`bg-slate-800/50 border-2 border-dashed rounded-lg p-4 cursor-pointer transition-all hover:bg-slate-800/70 hover:scale-105 ${
                    showCustomTemplate
                      ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
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
            )}
          </div>
        </div>

        {/* Fixed Bottom Section */}
        <div className="border-t border-slate-700 bg-slate-900/95 backdrop-blur-sm rounded-b-xl">
          {/* Custom Name Input */}
          {selectedTemplate && (
            <div className="p-4 border-b border-slate-700/50 bg-slate-800/30">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nom du conteneur (optionnel)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={sourceNode ? `${sourceNode.name} Container` : selectedTemplate.name}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between p-6">
            <div className="text-sm text-slate-400">
              {selectedTemplate ? (
                <span className="flex items-center gap-2">
                  <div className={selectedTemplate.color}>
                    {selectedTemplate.icon}
                  </div>
                  {selectedTemplate.name} sélectionné
                </span>
              ) : showCustomTemplate ? (
                <span className="flex items-center gap-2 text-purple-400">
                  <Plus className="h-4 w-4" />
                  Template personnalisé
                </span>
              ) : (
                'Sélectionnez un type de conteneur'
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors hover:bg-slate-800"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateContainer}
                disabled={!selectedTemplate && !(showCustomTemplate && customTemplate.name)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors font-medium shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                {showCustomTemplate ? 'Créer le conteneur personnalisé' : 'Créer le conteneur'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};