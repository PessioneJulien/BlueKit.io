'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  X, 
  Server, 
  Database, 
  HardDrive, 
  Wifi,
  Settings,
  Save,
  Plus
} from 'lucide-react';
import { ResourceStats } from './CanvasNode';
import { useConditionalScroll } from '@/lib/hooks/useConditionalScroll';

interface ComponentConfigModalProps {
  isOpen: boolean;
  nodeName: string;
  initialResources?: ResourceStats;
  initialEnvVars?: Record<string, string>;
  onSave: (resources: ResourceStats, envVars: Record<string, string>) => void;
  onClose: () => void;
}

export const ComponentConfigModal: React.FC<ComponentConfigModalProps> = ({
  isOpen,
  nodeName,
  initialResources,
  initialEnvVars = {},
  onSave,
  onClose
}) => {
  const [resources, setResources] = useState<ResourceStats>(
    initialResources || {
      cpu: '1 core',
      memory: '512MB',
      storage: '1GB',
      network: '10Mbps'
    }
  );

  const [envVars, setEnvVars] = useState<Record<string, string>>(initialEnvVars);
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvValue, setNewEnvValue] = useState('');
  
  // Hook pour la gestion du scroll conditionnel
  const { modalRef, isModalFocused } = useConditionalScroll(isOpen);

  const handleResourceChange = useCallback((field: keyof ResourceStats, value: string) => {
    setResources(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleAddEnvVar = useCallback(() => {
    if (newEnvKey.trim() && newEnvValue.trim()) {
      setEnvVars(prev => ({
        ...prev,
        [newEnvKey]: newEnvValue
      }));
      setNewEnvKey('');
      setNewEnvValue('');
    }
  }, [newEnvKey, newEnvValue]);

  const handleRemoveEnvVar = useCallback((key: string) => {
    setEnvVars(prev => {
      const newEnvVars = { ...prev };
      delete newEnvVars[key];
      return newEnvVars;
    });
  }, []);

  const handleSave = useCallback(() => {
    onSave(resources, envVars);
    onClose();
  }, [resources, envVars, onSave, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div 
        ref={modalRef}
        className={cn(
          "relative bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col",
          isModalFocused && "ring-2 ring-blue-500/50"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuration: {nodeName}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Configure resources and environment variables
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div data-scrollable className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Resource Configuration */}
          <div>
            <p className="text-lg font-medium text-slate-300 mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-400" />
              Ressources Système
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">CPU</label>
                <Input
                  value={resources.cpu}
                  onChange={(e) => handleResourceChange('cpu', e.target.value)}
                  placeholder="ex: 2 cores"
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-2">Mémoire</label>
                <Input
                  value={resources.memory}
                  onChange={(e) => handleResourceChange('memory', e.target.value)}
                  placeholder="ex: 1GB"
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-2 flex items-center gap-1">
                  <HardDrive className="w-4 h-4" />
                  Stockage
                </label>
                <Input
                  value={resources.storage || ''}
                  onChange={(e) => handleResourceChange('storage', e.target.value)}
                  placeholder="ex: 10GB"
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-2 flex items-center gap-1">
                  <Wifi className="w-4 h-4" />
                  Réseau
                </label>
                <Input
                  value={resources.network || ''}
                  onChange={(e) => handleResourceChange('network', e.target.value)}
                  placeholder="ex: 100Mbps"
                  className="bg-slate-800 border-slate-600"
                />
              </div>
            </div>
          </div>

          {/* Environment Variables */}
          <div>
            <p className="text-lg font-medium text-slate-300 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-green-400" />
              Variables d&apos;Environnement
            </p>
            
            {/* Add new env var */}
            <div className="flex gap-3 mb-4">
              <Input
                value={newEnvKey}
                onChange={(e) => setNewEnvKey(e.target.value)}
                placeholder="Nom de la variable"
                className="bg-slate-800 border-slate-600"
              />
              <Input
                value={newEnvValue}
                onChange={(e) => setNewEnvValue(e.target.value)}
                placeholder="Valeur"
                className="bg-slate-800 border-slate-600"
              />
              <Button
                onClick={handleAddEnvVar}
                disabled={!newEnvKey.trim() || !newEnvValue.trim()}
                variant="ghost"
                className="shrink-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Existing env vars */}
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3 bg-slate-800/50 rounded-lg p-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-mono text-slate-300 truncate">{key}</div>
                    <div className="text-sm font-mono text-slate-400 truncate">{value}</div>
                  </div>
                  <button
                    onClick={() => handleRemoveEnvVar(key)}
                    className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {Object.keys(envVars).length === 0 && (
                <div className="text-center text-slate-500 py-8 text-sm">
                  Aucune variable configurée
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-700">
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            Sauvegarder
          </Button>
        </div>
      </div>
    </div>
  );
};