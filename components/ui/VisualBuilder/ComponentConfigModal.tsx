'use client';

import { useState, useCallback } from 'react';
import { Server, Database, HardDrive, Wifi, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ResourceStats } from './CanvasNode';
import { BaseFloatingModal } from './BaseFloatingModal';

interface ComponentConfigModalProps {
  isOpen: boolean;
  nodeName: string;
  initialResources: ResourceStats;
  initialEnvVars: Record<string, string>;
  onSave: (resources: ResourceStats, envVars: Record<string, string>) => void;
  onClose: () => void;
}

export const ComponentConfigModal: React.FC<ComponentConfigModalProps> = ({
  isOpen,
  nodeName,
  initialResources,
  initialEnvVars,
  onSave,
  onClose
}) => {
  const [resources, setResources] = useState<ResourceStats>(initialResources);
  const [envVars, setEnvVars] = useState<Record<string, string>>(initialEnvVars);
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvValue, setNewEnvValue] = useState('');

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

  const footerActions = (
    <div className="flex justify-end gap-3">
      <Button variant="ghost" onClick={onClose}>
        Annuler
      </Button>
      <Button variant="primary" onClick={handleSave}>
        <Save className="h-4 w-4 mr-2" />
        Sauvegarder
      </Button>
    </div>
  );

  return (
    <BaseFloatingModal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuration du Composant"
      subtitle={nodeName}
      footerActions={footerActions}
      initialSize={{ width: 700, height: 600 }}
    >
      <div className="p-6 space-y-6">
        {/* Resource Configuration */}
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-4">Ressources système</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                <Server className="h-4 w-4" />
                CPU
              </label>
              <Input
                value={resources.cpu}
                onChange={(e) => handleResourceChange('cpu', e.target.value)}
                placeholder="2 cores"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                <Database className="h-4 w-4" />
                Mémoire
              </label>
              <Input
                value={resources.memory}
                onChange={(e) => handleResourceChange('memory', e.target.value)}
                placeholder="1GB"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                <HardDrive className="h-4 w-4" />
                Stockage
              </label>
              <Input
                value={resources.storage || ''}
                onChange={(e) => handleResourceChange('storage', e.target.value)}
                placeholder="10GB"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                <Wifi className="h-4 w-4" />
                Réseau
              </label>
              <Input
                value={resources.network || ''}
                onChange={(e) => handleResourceChange('network', e.target.value)}
                placeholder="100Mbps"
              />
            </div>
          </div>
        </div>

        {/* Environment Variables */}
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-4">Variables d&apos;environnement</h4>
          
          {/* Add new variable */}
          <div className="flex gap-2 mb-4">
            <Input
              value={newEnvKey}
              onChange={(e) => setNewEnvKey(e.target.value)}
              placeholder="Nom de la variable"
              onKeyPress={(e) => e.key === 'Enter' && handleAddEnvVar()}
            />
            <Input
              value={newEnvValue}
              onChange={(e) => setNewEnvValue(e.target.value)}
              placeholder="Valeur"
              onKeyPress={(e) => e.key === 'Enter' && handleAddEnvVar()}
            />
            <Button variant="ghost" size="sm" onClick={handleAddEnvVar}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* List of environment variables */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded">
                <code className="text-sm text-blue-400 flex-1">{key}</code>
                <span className="text-slate-500">=</span>
                <code className="text-sm text-green-400 flex-1">{value}</code>
                <button
                  onClick={() => handleRemoveEnvVar(key)}
                  className="p-1 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            {Object.keys(envVars).length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                Aucune variable d&apos;environnement définie
              </p>
            )}
          </div>
        </div>
      </div>
    </BaseFloatingModal>
  );
};