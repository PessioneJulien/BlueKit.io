'use client';

import { useState, useCallback } from 'react';
import { Plus, Trash2, Network, HardDrive, Info, Save } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BaseFloatingModal } from './BaseFloatingModal';

interface Port {
  id: string;
  containerPort: string;
  hostPort: string;
  protocol: 'tcp' | 'udp';
  description?: string;
}

interface Volume {
  id: string;
  hostPath: string;
  containerPath: string;
  type: 'bind' | 'volume' | 'tmpfs';
  readOnly: boolean;
  description?: string;
}

interface PortVolumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ports: Port[], volumes: Volume[]) => void;
  initialPorts: Port[];
  initialVolumes: Volume[];
  containerName: string;
  containerType: 'docker' | 'kubernetes';
}

export const PortVolumeModal: React.FC<PortVolumeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPorts,
  initialVolumes,
  containerName,
  containerType
}) => {
  const [ports, setPorts] = useState<Port[]>(initialPorts);
  const [volumes, setVolumes] = useState<Volume[]>(initialVolumes);
  const [activeTab, setActiveTab] = useState<'ports' | 'volumes'>('ports');

  const handleAddPort = useCallback(() => {
    const newPort: Port = {
      id: `port-${Date.now()}`,
      containerPort: '3000',
      hostPort: '3000',
      protocol: 'tcp',
      description: ''
    };
    setPorts(prev => [...prev, newPort]);
  }, []);

  const handleUpdatePort = useCallback((id: string, field: keyof Port, value: string | boolean) => {
    setPorts(prev => prev.map(port =>
      port.id === id ? { ...port, [field]: value } : port
    ));
  }, []);

  const handleRemovePort = useCallback((id: string) => {
    setPorts(prev => prev.filter(port => port.id !== id));
  }, []);

  const handleAddVolume = useCallback(() => {
    const newVolume: Volume = {
      id: `volume-${Date.now()}`,
      hostPath: '/host/path',
      containerPath: '/app/data',
      type: 'bind',
      readOnly: false,
      description: ''
    };
    setVolumes(prev => [...prev, newVolume]);
  }, []);

  const handleUpdateVolume = useCallback((id: string, field: keyof Volume, value: string | boolean) => {
    setVolumes(prev => prev.map(volume =>
      volume.id === id ? { ...volume, [field]: value } : volume
    ));
  }, []);

  const handleRemoveVolume = useCallback((id: string) => {
    setVolumes(prev => prev.filter(volume => volume.id !== id));
  }, []);

  const handleSave = useCallback(() => {
    onSave(ports, volumes);
    onClose();
  }, [ports, volumes, onSave, onClose]);

  const headerActions = (
    <div className="flex border-b border-slate-700">
      <button
        onClick={() => setActiveTab('ports')}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
          activeTab === 'ports'
            ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/50'
            : 'text-slate-400 hover:text-slate-300'
        }`}
      >
        <Network className="h-4 w-4" />
        Ports ({ports.length})
      </button>
      <button
        onClick={() => setActiveTab('volumes')}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
          activeTab === 'volumes'
            ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/50'
            : 'text-slate-400 hover:text-slate-300'
        }`}
      >
        <HardDrive className="h-4 w-4" />
        Volumes ({volumes.length})
      </button>
    </div>
  );

  const footerActions = (
    <div className="flex items-center justify-between">
      <div className="text-sm text-slate-400">
        {containerType === 'docker' ? '🐳' : '☸️'} Configuration {containerType}
      </div>
      <div className="flex gap-3">
        <Button variant="ghost" onClick={onClose}>
          Annuler
        </Button>
        <Button variant="primary" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Sauvegarder
        </Button>
      </div>
    </div>
  );

  return (
    <BaseFloatingModal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestion des Ports et Volumes"
      subtitle={`Configuration pour ${containerName} (${containerType})`}
      headerActions={headerActions}
      footerActions={footerActions}
      initialSize={{ width: 900, height: 700 }}
    >
      <div className="p-6">
        {activeTab === 'ports' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-300">
                <Network className="h-5 w-5" />
                <h3 className="font-medium">Configuration des Ports</h3>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Info className="h-3 w-3" />
                  Exposition des services vers l&apos;extérieur
                </div>
              </div>
              <Button
                onClick={handleAddPort}
                variant="primary"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un port
              </Button>
            </div>

            {ports.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Network className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                <p className="text-sm">Aucun port configuré</p>
                <p className="text-xs text-slate-600 mt-1">
                  Ajoutez des ports pour exposer vos services
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {ports.map((port) => (
                  <div key={port.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          Port Host
                        </label>
                        <Input
                          type="text"
                          value={port.hostPort}
                          onChange={(e) => handleUpdatePort(port.id, 'hostPort', e.target.value)}
                          placeholder="8080"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          Port Container
                        </label>
                        <Input
                          type="text"
                          value={port.containerPort}
                          onChange={(e) => handleUpdatePort(port.id, 'containerPort', e.target.value)}
                          placeholder="3000"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          Protocole
                        </label>
                        <select
                          value={port.protocol}
                          onChange={(e) => handleUpdatePort(port.id, 'protocol', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
                        >
                          <option value="tcp">TCP</option>
                          <option value="udp">UDP</option>
                        </select>
                      </div>
                      <div className="col-span-5">
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          Description
                        </label>
                        <Input
                          type="text"
                          value={port.description || ''}
                          onChange={(e) => handleUpdatePort(port.id, 'description', e.target.value)}
                          placeholder="API web principale"
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => handleRemovePort(port.id)}
                          className="p-2 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-500">
                      {port.hostPort}:{port.containerPort}/{port.protocol.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'volumes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-300">
                <HardDrive className="h-5 w-5" />
                <h3 className="font-medium">Configuration des Volumes</h3>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Info className="h-3 w-3" />
                  Persistance et partage de données
                </div>
              </div>
              <Button
                onClick={handleAddVolume}
                variant="success"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un volume
              </Button>
            </div>

            {volumes.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <HardDrive className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                <p className="text-sm">Aucun volume configuré</p>
                <p className="text-xs text-slate-600 mt-1">
                  Ajoutez des volumes pour persister vos données
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {volumes.map((volume) => (
                  <div key={volume.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-3">
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          Chemin Host
                        </label>
                        <Input
                          type="text"
                          value={volume.hostPath}
                          onChange={(e) => handleUpdateVolume(volume.id, 'hostPath', e.target.value)}
                          placeholder="/host/data"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          Chemin Container
                        </label>
                        <Input
                          type="text"
                          value={volume.containerPath}
                          onChange={(e) => handleUpdateVolume(volume.id, 'containerPath', e.target.value)}
                          placeholder="/app/data"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          Type
                        </label>
                        <select
                          value={volume.type}
                          onChange={(e) => handleUpdateVolume(volume.id, 'type', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
                        >
                          <option value="bind">Bind</option>
                          <option value="volume">Volume</option>
                          <option value="tmpfs">TmpFS</option>
                        </select>
                      </div>
                      <div className="col-span-1">
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          Mode
                        </label>
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={volume.readOnly}
                            onChange={(e) => handleUpdateVolume(volume.id, 'readOnly', e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded"
                          />
                        </div>
                        <div className="text-xs text-slate-500 text-center mt-1">RO</div>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          Description
                        </label>
                        <Input
                          type="text"
                          value={volume.description || ''}
                          onChange={(e) => handleUpdateVolume(volume.id, 'description', e.target.value)}
                          placeholder="Données DB"
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => handleRemoveVolume(volume.id)}
                          className="p-2 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <Badge variant="secondary" className="text-xs">
                        {volume.type}
                      </Badge>
                      <span className="text-slate-500">
                        {volume.hostPath} → {volume.containerPath}
                        {volume.readOnly && ' (RO)'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </BaseFloatingModal>
  );
};