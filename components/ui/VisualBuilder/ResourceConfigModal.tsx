'use client';

import { useState, useCallback, useEffect } from 'react';
import { Server, Database, HardDrive, Wifi, Save, Plus, Trash2, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ResourceStats } from './CanvasNode';
import { BaseFloatingModal } from './BaseFloatingModal';

interface ResourceConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (resources: ResourceStats, envVars: Record<string, string>) => void;
  initialResources?: ResourceStats;
  initialEnvVars?: Record<string, string>;
  componentName: string;
}

export const ResourceConfigModal: React.FC<ResourceConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialResources,
  initialEnvVars = {},
  componentName
}) => {
  console.log('ResourceConfigModal props:', { isOpen, initialResources, componentName }); // Debug
  
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

  // Editable CPU/Memory values with units
  const [cpuValue, setCpuValue] = useState<string>('1');
  const [cpuUnit, setCpuUnit] = useState<'cores' | 'm'>('cores');
  const [memoryValue, setMemoryValue] = useState<string>('512');
  const [memoryUnit, setMemoryUnit] = useState<'MB' | 'GB'>('MB');

  // Initialize values from initial resources when modal opens
  useEffect(() => {
    if (isOpen && initialResources) {
      console.log('Initializing modal with resources:', initialResources); // Debug
      setResources(initialResources);
      
      if (initialResources.cpu) {
        const cpuMatch = initialResources.cpu.match(/(\d+(?:\.\d+)?)\s*(m|core|cores|CPU)/i);
        if (cpuMatch) {
          setCpuValue(cpuMatch[1]);
          setCpuUnit(cpuMatch[2].toLowerCase().includes('m') ? 'm' : 'cores');
        }
      }
      
      if (initialResources.memory) {
        const memMatch = initialResources.memory.match(/(\d+(?:\.\d+)?)\s*(MB|GB)/i);
        if (memMatch) {
          setMemoryValue(memMatch[1]);
          setMemoryUnit(memMatch[2].toUpperCase() as 'MB' | 'GB');
        }
      }
    }
  }, [isOpen, initialResources]);

  const handleResourceChange = useCallback((field: keyof ResourceStats, value: string) => {
    setResources(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleCpuChange = useCallback(() => {
    const value = parseFloat(cpuValue) || 1;
    let formattedCpu: string;
    
    if (cpuUnit === 'm') {
      formattedCpu = `${Math.round(value)}m CPU`;
    } else {
      formattedCpu = `${value} ${value === 1 ? 'core' : 'cores'}`;
    }
    
    console.log('CPU changed:', formattedCpu); // Debug
    setResources(prev => ({ ...prev, cpu: formattedCpu }));
  }, [cpuValue, cpuUnit]);

  const handleMemoryChange = useCallback(() => {
    const value = parseFloat(memoryValue) || 512;
    const formattedMemory = `${value}${memoryUnit}`;
    console.log('Memory changed:', formattedMemory); // Debug
    setResources(prev => ({ ...prev, memory: formattedMemory }));
  }, [memoryValue, memoryUnit]);

  // Auto-update CPU when values change
  useEffect(() => {
    if (cpuValue && cpuUnit) {
      console.log('Auto-updating CPU:', cpuValue, cpuUnit); // Debug
      handleCpuChange();
    }
  }, [cpuValue, cpuUnit, handleCpuChange]);

  // Auto-update Memory when values change
  useEffect(() => {
    if (memoryValue && memoryUnit) {
      console.log('Auto-updating Memory:', memoryValue, memoryUnit); // Debug
      handleMemoryChange();
    }
  }, [memoryValue, memoryUnit, handleMemoryChange]);

  const handleAddEnvVar = useCallback(() => {
    if (newEnvKey.trim() && newEnvValue.trim()) {
      setEnvVars(prev => ({
        ...prev,
        [newEnvKey.trim()]: newEnvValue.trim()
      }));
      setNewEnvKey('');
      setNewEnvValue('');
    }
  }, [newEnvKey, newEnvValue]);

  const handleRemoveEnvVar = useCallback((key: string) => {
    setEnvVars(prev => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  }, []);

  const handleSave = useCallback(() => {
    console.log('ResourceConfigModal: Saving resources:', resources); // Debug
    console.log('ResourceConfigModal: Component name:', componentName); // Debug
    onSave(resources, envVars);
    onClose();
  }, [resources, envVars, onSave, onClose, componentName]);

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
      title="Configuration des Ressources"
      subtitle={componentName}
      footerActions={footerActions}
      initialSize={{ width: 700, height: 600 }}
    >
      <div className="p-6 space-y-6">
        {/* Resource Configuration */}
        <div>
          <h4 className="text-sm font-medium text-slate-300 mb-4">Ressources système</h4>
          <div className="grid grid-cols-2 gap-4">
            {/* CPU with editable units */}
            <div>
              <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                <Server className="h-4 w-4" />
                CPU
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 flex-1">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <input
                    type="number"
                    value={cpuValue}
                    onChange={(e) => setCpuValue(e.target.value)}
                    className="bg-transparent text-slate-200 text-sm flex-1 focus:outline-none"
                    min="0.1"
                    max="16"
                    step="0.1"
                    placeholder="1"
                  />
                </div>
                <select
                  value={cpuUnit}
                  onChange={(e) => {
                    const newUnit = e.target.value as 'cores' | 'm';
                    setCpuUnit(newUnit);
                    // Trigger change immediately with new unit
                    const value = parseFloat(cpuValue) || 1;
                    let formattedCpu: string;
                    if (newUnit === 'm') {
                      formattedCpu = `${Math.round(value)}m CPU`;
                    } else {
                      formattedCpu = `${value} ${value === 1 ? 'core' : 'cores'}`;
                    }
                    setResources(prev => ({ ...prev, cpu: formattedCpu }));
                  }}
                  className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-slate-200 text-sm min-w-[70px]"
                >
                  <option value="cores">cores</option>
                  <option value="m">m</option>
                </select>
              </div>
            </div>
            
            {/* Memory with editable units */}
            <div>
              <label className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                <Database className="h-4 w-4" />
                Mémoire
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 flex-1">
                  <HardDrive className="w-4 h-4 text-green-400" />
                  <input
                    type="number"
                    value={memoryValue}
                    onChange={(e) => setMemoryValue(e.target.value)}
                    className="bg-transparent text-slate-200 text-sm flex-1 focus:outline-none"
                    min={memoryUnit === 'GB' ? '0.1' : '64'}
                    max={memoryUnit === 'GB' ? '32' : '32768'}
                    step={memoryUnit === 'GB' ? '0.1' : '64'}
                    placeholder="512"
                  />
                </div>
                <select
                  value={memoryUnit}
                  onChange={(e) => {
                    const newUnit = e.target.value as 'MB' | 'GB';
                    const currentValue = parseFloat(memoryValue) || 1;
                    let newValue = currentValue;
                    
                    // Convert value when switching units
                    if (memoryUnit === 'MB' && newUnit === 'GB') {
                      newValue = currentValue / 1024;
                      setMemoryValue(newValue.toFixed(1));
                    } else if (memoryUnit === 'GB' && newUnit === 'MB') {
                      newValue = currentValue * 1024;
                      setMemoryValue(newValue.toString());
                    }
                    
                    setMemoryUnit(newUnit);
                    // Apply change immediately
                    const formattedMemory = `${newValue}${newUnit}`;
                    setResources(prev => ({ ...prev, memory: formattedMemory }));
                  }}
                  className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-slate-200 text-sm min-w-[70px]"
                >
                  <option value="MB">MB</option>
                  <option value="GB">GB</option>
                </select>
              </div>
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