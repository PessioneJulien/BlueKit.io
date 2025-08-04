'use client';

import { useState, useCallback } from 'react';
import { X, Plus, Trash2, Network, HardDrive, Info } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-slate-900 border border-slate-700 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Gestion des Ports et Volumes
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Configuration pour {containerName} ({containerType})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            onClick={() => setActiveTab('ports')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
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
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'volumes'
                ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/50'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <HardDrive className="h-4 w-4" />
            Volumes ({volumes.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {activeTab === 'ports' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <Network className="h-5 w-5" />
                  <h3 className="font-medium">Configuration des Ports</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Info className="h-3 w-3" />
                    Exposition des services vers l'extérieur
                  </div>
                </div>
                <button
                  onClick={handleAddPort}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un port
                </button>
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
                          <input
                            type="text"
                            value={port.hostPort}
                            onChange={(e) => handleUpdatePort(port.id, 'hostPort', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
                            placeholder="8080"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-slate-400 mb-1">
                            Port Container
                          </label>
                          <input
                            type="text"
                            value={port.containerPort}
                            onChange={(e) => handleUpdatePort(port.id, 'containerPort', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
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
                          <input
                            type="text"
                            value={port.description || ''}
                            onChange={(e) => handleUpdatePort(port.id, 'description', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
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
                <button
                  onClick={handleAddVolume}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un volume
                </button>
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
                          <input
                            type="text"
                            value={volume.hostPath}
                            onChange={(e) => handleUpdateVolume(volume.id, 'hostPath', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
                            placeholder="/host/data"
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-xs font-medium text-slate-400 mb-1">
                            Chemin Container
                          </label>
                          <input
                            type="text"
                            value={volume.containerPath}
                            onChange={(e) => handleUpdateVolume(volume.id, 'containerPath', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
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
                          <input
                            type="text"
                            value={volume.description || ''}
                            onChange={(e) => handleUpdateVolume(volume.id, 'description', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white"
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

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700">
          <div className="text-sm text-slate-400">
            {containerType === 'docker' ? '🐳' : '☸️'} Configuration {containerType}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};