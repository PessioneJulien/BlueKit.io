'use client';

import { memo, useState, useCallback, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { ContainerNodeData, AutoCalculatedResources, ManualResourceLimits, ResourceMode } from './types/ContainerTypes';
import { 
  Box, 
  Layers, 
  Server,
  Settings,
  Database,
  Network,
  MoreVertical,
  Maximize2,
  Minimize2,
  Plus,
  ChevronDown,
  ChevronRight,
  X,
  Cpu,
  HardDrive,
  Zap,
  AlertTriangle
} from 'lucide-react';

// Interface pour les containers modernisée
export interface ModernContainerData extends ContainerNodeData {
  // Resource management
  resourceMode: ResourceMode;
  autoResources?: AutoCalculatedResources;
  manualLimits?: ManualResourceLimits;
  
  // Visual properties
  isCompact: boolean;
  width: number;
  height: number;
  
  // Callbacks
  onToggleCompact: (id: string) => void;
  onDelete: (id: string) => void;
  onConfigure?: (id: string, config: Record<string, unknown>) => void;
  onResourceModeChange?: (id: string, mode: ResourceMode, limits?: ManualResourceLimits) => void;
  onRemoveFromContainer?: (containerId: string, nodeId: string) => void;
  onResize?: (id: string, width: number, height: number) => void;
  onNodeSelect?: (nodeId: string) => void;
}

type ModernContainerProps = NodeProps<ModernContainerData>;

/**
 * Container moderne avec design 2025 et fonctionnalités complètes
 */
export const ModernContainer = memo<ModernContainerProps>(({ 
  data,
  selected = false,
  dragging = false 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showServices, setShowServices] = useState(!data.isCompact);
  const [isDragOver, setIsDragOver] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    containerType,
    containedNodes,
    resourceMode,
    manualLimits,
    ports = [],
    status,
    replicas,
    width,
    height,
    isCompact,
    onToggleCompact,
    onDelete,
    onResourceModeChange,
    onRemoveFromContainer,
    onResize,
    onNodeSelect
  } = data;

  // Calcul des ressources automatiques
  const calculateAutoResources = useCallback(() => {
    let totalCpuUnits = 0;
    let totalMemoryMB = 0;

    containedNodes.forEach(node => {
      if (node.resources) {
        // Parse CPU
        const cpuStr = node.resources.cpu.toLowerCase();
        if (cpuStr.includes('m')) {
          totalCpuUnits += parseInt(cpuStr.replace('m', '')) / 1000;
        } else {
          const cpuMatch = cpuStr.match(/(\d+(?:\.\d+)?)/);
          if (cpuMatch) totalCpuUnits += parseFloat(cpuMatch[1]);
        }

        // Parse Memory
        const memStr = node.resources.memory.toLowerCase();
        if (memStr.includes('gb')) {
          const memMatch = memStr.match(/(\d+(?:\.\d+)?)/);
          if (memMatch) totalMemoryMB += parseFloat(memMatch[1]) * 1024;
        } else if (memStr.includes('mb')) {
          const memMatch = memStr.match(/(\d+(?:\.\d+)?)/);
          if (memMatch) totalMemoryMB += parseFloat(memMatch[1]);
        }
      }
    });

    const cpu = totalCpuUnits >= 1 
      ? `${totalCpuUnits % 1 === 0 ? totalCpuUnits : totalCpuUnits.toFixed(1)} CPU${totalCpuUnits > 1 ? 's' : ''}`
      : `${Math.round(totalCpuUnits * 1000)}m`;
    
    const memory = totalMemoryMB >= 1024
      ? `${(totalMemoryMB / 1024).toFixed(1)} GB`
      : `${Math.round(totalMemoryMB)} MB`;

    return { cpu, memory, cpuUnits: totalCpuUnits, memoryMB: totalMemoryMB };
  }, [containedNodes]);

  // Ressources affichées selon le mode
  const displayedResources = resourceMode === 'manual' && manualLimits 
    ? { cpu: manualLimits.cpu, memory: manualLimits.memory }
    : calculateAutoResources();

  // Pagination des services - adaptatif selon la taille du container
  const getServicesPerPage = useCallback(() => {
    const availableHeight = height - 180; // Header + resource bar + padding
    const serviceHeight = 80; // Hauteur approximative par service
    return Math.max(2, Math.floor(availableHeight / serviceHeight));
  }, [height]);

  const servicesPerPage = getServicesPerPage();
  const totalPages = Math.ceil(containedNodes.length / servicesPerPage);
  const startIndex = currentPage * servicesPerPage;
  const endIndex = Math.min(startIndex + servicesPerPage, containedNodes.length);
  const currentServices = containedNodes.slice(startIndex, endIndex);

  // Reset page when services change
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [currentPage, totalPages]);

  // Icône du container selon le type
  const getContainerIcon = () => {
    const iconClass = "w-5 h-5";
    switch (containerType) {
      case 'docker':
        return <Box className={cn(iconClass, "text-blue-400")} />;
      case 'kubernetes':
        return <Layers className={cn(iconClass, "text-green-400")} />;
      default:
        return <Server className={cn(iconClass, "text-slate-400")} />;
    }
  };

  // Couleur du statut
  const getStatusInfo = () => {
    switch (status) {
      case 'running':
        return { color: 'bg-green-500', text: 'Running', textColor: 'text-green-400' };
      case 'stopped':
        return { color: 'bg-red-500', text: 'Stopped', textColor: 'text-red-400' };
      case 'building':
        return { color: 'bg-yellow-500', text: 'Building', textColor: 'text-yellow-400' };
      case 'error':
        return { color: 'bg-red-500', text: 'Error', textColor: 'text-red-400' };
      default:
        return { color: 'bg-slate-500', text: 'Unknown', textColor: 'text-slate-400' };
    }
  };

  const statusInfo = getStatusInfo();

  // Configuration des tailles min/max selon le type de container (tailles raisonnables)
  const getMinMaxSize = useCallback(() => {
    switch (containerType) {
      case 'kubernetes':
        return { minWidth: 300, minHeight: 200, maxWidth: 600, maxHeight: 500 };
      case 'docker':
        return { minWidth: 280, minHeight: 180, maxWidth: 550, maxHeight: 450 };
      default:
        return { minWidth: 290, minHeight: 190, maxWidth: 580, maxHeight: 480 };
    }
  }, [containerType]);

  const { minWidth, minHeight, maxWidth, maxHeight } = getMinMaxSize();

  // Calcul de la taille adaptative au contenu
  const calculateAdaptiveSize = useCallback(() => {
    const baseHeight = 180; // Header + resource bar + padding
    const serviceHeight = showServices ? 80 : 0; // Hauteur par service
    const paginationHeight = totalPages > 1 ? 40 : 0;
    const servicesHeight = Math.min(currentServices.length, servicesPerPage) * serviceHeight;
    
    const adaptiveHeight = baseHeight + paginationHeight + servicesHeight + 20; // +20 padding
    const adaptiveWidth = Math.max(minWidth, containedNodes.length > 0 ? 320 : 300);
    
    return { 
      width: Math.min(maxWidth, Math.max(minWidth, adaptiveWidth)),
      height: Math.min(maxHeight, Math.max(minHeight, adaptiveHeight))
    };
  }, [showServices, totalPages, currentServices.length, servicesPerPage, containedNodes.length, minWidth, minHeight, maxWidth, maxHeight]);

  const suggestedSize = calculateAdaptiveSize();
  const currentWidth = width || suggestedSize.width;
  const currentHeight = height || suggestedSize.height;
  
  // Debug: log when dimensions change (disabled for production)
  // console.log('🏗️ ModernContainer render:', data.id, 'width:', width, 'height:', height, 'current:', currentWidth, 'x', currentHeight);



  // Toggle resource mode
  const handleResourceModeToggle = useCallback(() => {
    const newMode = resourceMode === 'auto' ? 'manual' : 'auto';
    if (onResourceModeChange) {
      if (newMode === 'manual') {
        const autoCalc = calculateAutoResources();
        onResourceModeChange(data.id, 'manual', {
          cpu: autoCalc.cpu,
          memory: autoCalc.memory
        });
      } else {
        onResourceModeChange(data.id, 'auto');
      }
    }
  }, [resourceMode, onResourceModeChange, data.id, calculateAutoResources]);


  return (
    <div
      ref={containerRef}
      className={cn(
        "relative bg-slate-800/95 backdrop-blur-md rounded-xl border-2 transition-all duration-300",
        "shadow-xl hover:shadow-2xl",
        selected ? "border-blue-500/60 shadow-blue-500/20" : "border-slate-600/50 hover:border-slate-500/70",
        isDragOver && "border-green-500/80 shadow-green-500/30 bg-green-900/10",
        dragging && "opacity-80 scale-105 rotate-1"
      )}
      style={{ 
        width: currentWidth, 
        height: currentHeight
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        // Handle drop logic here
      }}
    >
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-4 h-4 bg-blue-600/80 border-2 border-blue-400 hover:bg-blue-500 hover:scale-125 transition-all duration-200"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-4 h-4 bg-green-600/80 border-2 border-green-400 hover:bg-green-500 hover:scale-125 transition-all duration-200"
      />

      {/* Header */}
      <div className={cn(
        "flex items-center justify-between p-4 border-b border-slate-700/50 rounded-t-xl",
        "bg-gradient-to-r from-slate-700/30 to-slate-600/30"
      )}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {getContainerIcon()}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-100 text-lg truncate">
              {data.name}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant="outline" className="text-xs">
                {containerType}
              </Badge>
              <div className={cn("flex items-center gap-1.5 text-sm", statusInfo.textColor)}>
                <div className={cn("w-2 h-2 rounded-full animate-pulse", statusInfo.color)} />
                {statusInfo.text}
              </div>
              {replicas && replicas > 1 && (
                <Badge variant="outline" className="text-xs">
                  {replicas}x
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Services toggle */}
          <button
            onClick={() => setShowServices(!showServices)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            title="Toggle services view"
          >
            {showServices ? 
              <ChevronDown className="w-4 h-4 text-slate-400" /> : 
              <ChevronRight className="w-4 h-4 text-slate-400" />
            }
          </button>

          {/* Container Config toggle */}
          <button
            onClick={() => onNodeSelect && onNodeSelect(data.id)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            title="Configure container size"
          >
            <Settings className="w-4 h-4 text-slate-400" />
          </button>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-slate-400" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-12 right-0 z-50 bg-slate-800 border border-slate-600 rounded-lg shadow-xl py-1 min-w-[180px]"
                >
                  <button
                    onClick={handleResourceModeToggle}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
                  >
                    <Database className="w-4 h-4" />
                    {resourceMode === 'auto' ? 'Switch to Manual' : 'Switch to Auto'}
                  </button>
                  <button
                    onClick={() => {
                      onDelete(data.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20"
                  >
                    <X className="w-4 h-4" />
                    Delete Container
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Resource Info Bar */}
      <div className={cn(
        "flex items-center justify-between px-4 py-2 bg-slate-700/20 border-b border-slate-700/30",
        resourceMode === 'manual' && "bg-orange-900/10 border-orange-500/20"
      )}>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span className="text-slate-300">{displayedResources.cpu}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-green-400" />
            <span className="text-slate-300">{displayedResources.memory}</span>
          </div>
          {ports.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Network className="w-4 h-4 text-purple-400" />
              <span className="text-slate-400">{ports.length} port{ports.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        <Badge 
          variant={resourceMode === 'auto' ? 'default' : 'warning'}
          className={cn(
            "text-xs",
            resourceMode === 'auto' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-orange-500/20 text-orange-300 border-orange-500/30'
          )}
        >
          {resourceMode === 'auto' ? 'AUTO' : 'MANUAL'}
        </Badge>
      </div>

      {/* Services Area */}
      <div 
        className="relative overflow-hidden"
        style={{ height: currentHeight - 160 }} // Header + resource bar + padding
      >
        <AnimatePresence>
          {showServices && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4"
            >
              {containedNodes.length === 0 ? (
                <div className={cn(
                  "flex flex-col items-center justify-center h-full min-h-[120px] text-center",
                  "border-2 border-dashed rounded-lg transition-all duration-200",
                  isDragOver ? "border-green-400 bg-green-400/10" : "border-slate-600 hover:border-slate-500"
                )}>
                  <div className="relative mb-3">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Plus className="w-10 h-10 text-slate-500 relative z-10" />
                  </div>
                  <p className="text-sm font-medium text-slate-400 mb-1">Drop components here</p>
                  <p className="text-xs text-slate-500">to containerize them</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between bg-slate-700/20 rounded-lg px-3 py-2 border border-slate-600/30">
                      <button
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-600/50 hover:bg-slate-600/70 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                      >
                        <ChevronRight className="w-3 h-3 rotate-180" />
                        Précédent
                      </button>
                      
                      <div className="flex items-center gap-2 text-xs text-slate-300">
                        <span>Page {currentPage + 1} sur {totalPages}</span>
                        <div className="w-px h-4 bg-slate-600"></div>
                        <span>{containedNodes.length} services</span>
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={currentPage === totalPages - 1}
                        className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-600/50 hover:bg-slate-600/70 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                      >
                        Suivant
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Services List */}
                  <div className="space-y-3">
                    {currentServices.map((node, index) => (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-slate-700/30 border border-slate-600/40 rounded-lg p-4 hover:bg-slate-700/50 transition-all duration-200 space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        {/* Service icon */}
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0",
                          node.category === 'frontend' ? 'bg-blue-500/20 text-blue-400' :
                          node.category === 'backend' ? 'bg-green-500/20 text-green-400' :
                          node.category === 'database' ? 'bg-purple-500/20 text-purple-400' :
                          node.category === 'devops' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-slate-500/20 text-slate-400'
                        )}>
                          {node.category === 'frontend' && '🎨'}
                          {node.category === 'backend' && '⚙️'}
                          {node.category === 'database' && '🗄️'}
                          {node.category === 'devops' && '🚀'}
                          {!['frontend', 'backend', 'database', 'devops'].includes(node.category) && '📦'}
                        </div>

                        {/* Service info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-100 truncate">{node.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" size="sm" className="text-xs">
                              {node.category}
                            </Badge>
                            {node.subTechnologies && node.subTechnologies.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Zap className="w-3 h-3 text-green-400" />
                                <span className="text-xs text-green-400">
                                  {node.subTechnologies.length} tool{node.subTechnologies.length > 1 ? 's' : ''}
                                </span>
                              </div>
                            )}
                          </div>

                        </div>

                        {/* Service Resources */}
                        {node.resources && (
                          <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-600/20">
                            <div className="flex items-center gap-3 text-xs">
                              <div className="flex items-center gap-1">
                                <Cpu className="w-3 h-3 text-blue-400" />
                                <span className="text-slate-300">{node.resources.cpu}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <HardDrive className="w-3 h-3 text-green-400" />
                                <span className="text-slate-300">{node.resources.memory}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tools preview - AMÉLIORÉ */}
                        {node.subTechnologies && node.subTechnologies.length > 0 && (
                          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg p-2 border border-green-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="w-4 h-4 text-green-400" />
                              <span className="text-sm font-medium text-green-300">
                                {node.subTechnologies.length} Tools
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              {node.subTechnologies.map((tool) => (
                                <Badge
                                  key={tool.id}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs bg-green-600/20 text-green-200 border-green-500/30 justify-start h-7"
                                >
                                  <span className="mr-1">
                                    {tool.type === 'styling' && '🎨'}
                                    {tool.type === 'testing' && '🧪'}
                                    {tool.type === 'documentation' && '📚'}
                                    {tool.type === 'state-management' && '📊'}
                                    {tool.type === 'routing' && '🗺️'}
                                    {tool.type === 'build-tool' && '🔨'}
                                    {tool.type === 'linting' && '✅'}
                                    {!['styling', 'testing', 'documentation', 'state-management', 'routing', 'build-tool', 'linting'].includes(tool.type) && '🔧'}
                                  </span>
                                  <span className="truncate">
                                    {tool.name.length > 8 ? tool.name.substring(0, 8) + '...' : tool.name}
                                  </span>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          {onNodeSelect && (
                            <button
                              onClick={() => onNodeSelect(node.id)}
                              className="p-1.5 hover:bg-slate-600 rounded text-slate-400 hover:text-slate-200 transition-colors"
                              title="Configure service"
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                          )}
                          {onRemoveFromContainer && (
                            <button
                              onClick={() => onRemoveFromContainer(data.id, node.id)}
                              className="p-1.5 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded transition-colors"
                              title="Remove from container"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>



      {/* Resource violation warning */}
      {resourceMode === 'manual' && (
        <div className="absolute -top-3 left-4">
          <div className="bg-orange-500/20 border border-orange-500/40 rounded-full p-1">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>
        </div>
      )}
    </div>
  );
});

ModernContainer.displayName = 'ModernContainer';