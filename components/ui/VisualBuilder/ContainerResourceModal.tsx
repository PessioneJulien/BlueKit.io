'use client';

import { useState, useCallback, useEffect } from 'react';
import { AlertTriangle, Server, Database, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { BaseFloatingModal } from './BaseFloatingModal';

interface ContainerResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: {
    resourceMode: 'auto' | 'manual';
    manualResourceLimits?: { cpu: string; memory: string };
  }) => void;
  containerName: string;
  currentMode?: 'auto' | 'manual';
  currentManualLimits?: { cpu: string; memory: string };
  autoCalculatedResources: { cpu: string; memory: string };
  containedNodesCount: number;
}

export const ContainerResourceModal: React.FC<ContainerResourceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  containerName,
  currentMode = 'auto',
  currentManualLimits,
  autoCalculatedResources,
  containedNodesCount
}) => {
  const [resourceMode, setResourceMode] = useState<'auto' | 'manual'>(currentMode);
  const [manualLimits, setManualLimits] = useState({
    cpu: currentManualLimits?.cpu || '2 CPU',
    memory: currentManualLimits?.memory || '2 GB'
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setResourceMode(currentMode);
      setManualLimits(currentManualLimits || { cpu: '2 CPU', memory: '2 GB' });
    }
  }, [isOpen, currentMode, currentManualLimits]);

  const handleSave = useCallback(() => {
    const config = {
      resourceMode,
      ...(resourceMode === 'manual' && { manualResourceLimits: manualLimits })
    };
    onSave(config);
    onClose();
  }, [resourceMode, manualLimits, onSave, onClose]);

  const handleLimitChange = useCallback((field: 'cpu' | 'memory', value: string) => {
    setManualLimits(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  if (!isOpen) return null;

  return (
    <BaseFloatingModal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuration des ressources"
      width="500px"
    >
      <div className="space-y-6">
        {/* Container Info */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <Server className="h-5 w-5 text-blue-400" />
            <h3 className="font-semibold text-slate-200">{containerName}</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Services contenus:</span>
              <div className="text-slate-200 font-medium">{containedNodesCount}</div>
            </div>
            <div>
              <span className="text-slate-400">Ressources auto-calculées:</span>
              <div className="text-slate-200 font-medium">
                {autoCalculatedResources.cpu} • {autoCalculatedResources.memory}
              </div>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="space-y-4">
          <h4 className="font-medium text-slate-200 mb-3">Mode de gestion des ressources</h4>
          
          {/* Auto Mode */}
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              resourceMode === 'auto' 
                ? 'border-blue-500 bg-blue-600/10' 
                : 'border-slate-600 hover:border-slate-500'
            }`}
            onClick={() => setResourceMode('auto')}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {resourceMode === 'auto' ? (
                  <ToggleRight className="h-5 w-5 text-blue-400" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-slate-400" />
                )}
                <span className="font-medium text-slate-200">Mode Automatique</span>
                <Badge variant="outline" className="text-xs text-blue-300 border-blue-500/30">
                  Recommandé
                </Badge>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-2">
              Les ressources sont calculées automatiquement en fonction des composants contenus.
            </p>
            <div className="text-sm text-slate-300">
              Ressources actuelles: <span className="font-medium">{autoCalculatedResources.cpu} • {autoCalculatedResources.memory}</span>
            </div>
          </div>

          {/* Manual Mode */}
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              resourceMode === 'manual' 
                ? 'border-purple-500 bg-purple-600/10' 
                : 'border-slate-600 hover:border-slate-500'
            }`}
            onClick={() => setResourceMode('manual')}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                {resourceMode === 'manual' ? (
                  <ToggleRight className="h-5 w-5 text-purple-400" />
                ) : (
                  <ToggleLeft className="h-5 w-5 text-slate-400" />
                )}
                <span className="font-medium text-slate-200">Mode Manuel</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-3">
              Définissez des limites fixes. Une alerte apparaîtra si les composants dépassent ces limites.
            </p>
            
            {resourceMode === 'manual' && (
              <div className="space-y-3 mt-4 p-3 bg-slate-700/30 rounded border-l-4 border-purple-500/50">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Limite CPU
                    </label>
                    <Input
                      value={manualLimits.cpu}
                      onChange={(e) => handleLimitChange('cpu', e.target.value)}
                      placeholder="2 CPU"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Limite Mémoire
                    </label>
                    <Input
                      value={manualLimits.memory}
                      onChange={(e) => handleLimitChange('memory', e.target.value)}
                      placeholder="2 GB"
                      className="text-sm"
                    />
                  </div>
                </div>
                
                {/* Warning if current usage exceeds manual limits */}
                {resourceMode === 'manual' && (
                  <div className="flex items-start gap-2 p-2 bg-amber-600/10 border border-amber-500/30 rounded text-xs">
                    <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-amber-300">
                      <div className="font-medium mb-1">Important:</div>
                      Si les composants contenus dépassent ces limites,
                      une alerte rouge apparaîtra dans l&apos;interface.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Sauvegarder
          </Button>
        </div>
      </div>
    </BaseFloatingModal>
  );
};