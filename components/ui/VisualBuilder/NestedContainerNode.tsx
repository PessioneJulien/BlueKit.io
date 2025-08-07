'use client';

import { memo, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { 
  X, 
  MoreVertical, 
  Settings, 
  Info, 
  FileText, 
  Layers,
  Plus,
  Minimize2,
  Maximize2,
  Server,
  Box,
  Database,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { NodeData, ResourceStats } from './CanvasNode';
import { ResourceConfigModal } from './ResourceConfigModal';
import { PortVolumeModal } from './PortVolumeModal';
import { ComponentConfigModal } from './ComponentConfigModal';
import { ContainerResourceModal } from './ContainerResourceModal';
import { ResizeHandle } from './ResizeHandle';

export interface NestedContainerNodeData extends NodeData {
  isContainer: true;
  containerType: 'docker' | 'kubernetes';
  containedNodes: NodeData[];
  ports?: string[];
  networks?: string[];
  replicas?: number;
  // status: 'running' | 'stopped' | 'pending'; // Removed - not useful
  resources: {
    cpu: string;
    memory: string;
  };
  // Resource management mode
  resourceMode?: 'auto' | 'manual';
  manualResourceLimits?: {
    cpu: string;
    memory: string;
  };
  // Visual properties
  width: number;
  height: number;
  isCompact: boolean;
  onDelete: () => void;
  onToggleCompact: () => void;
  onConfigure?: (resources: ResourceStats, envVars: Record<string, string>) => void;
  onRemoveFromContainer?: (containerId: string, nodeId: string) => void;
  onDropComponent?: (component: NodeData, position: { x: number; y: number }) => void;
  onAddComponentToContainer?: (component: NodeData, containerId: string, isMoving?: boolean) => void;
  onNameChange?: (nodeId: string, newName: string) => void;
  onResize?: (id: string, width: number, height: number) => void;
  draggingNodeId?: string | null;
  draggingNode?: NodeData | null;
  mousePosition?: { x: number; y: number } | null;
}

export const NestedContainerNode = memo<NodeProps<NestedContainerNodeData>>(({ 
  id,
  data,
  selected 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showContainerResourceModal, setShowContainerResourceModal] = useState(false);
  const [showPortVolumeModal, setShowPortVolumeModal] = useState(false);
  const [selectedNodeConfig, setSelectedNodeConfig] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(data.name);
  const [isDragOver, setIsDragOver] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    name,
    description,
    containerType,
    containedNodes,
    ports = [],
    replicas,
    // status, // Removed - not useful
    resources,
    width = 400,
    height = 300,
    isCompact = false,
    onDelete,
    onToggleCompact,
    onConfigure,
    onRemoveFromContainer,
    onDropComponent,
    onAddComponentToContainer,
    onNameChange,
    onResize,
    draggingNodeId,
    draggingNode,
    mousePosition
  } = data;

  // Show ghost preview when a node is being dragged and mouse is over container
  const shouldShowGhost = draggingNodeId && draggingNode && isDragOver && draggingNodeId !== id;
  const ghostNode = shouldShowGhost ? draggingNode : null;

  // Debug ghost mode (commented out for production)
  // console.log('🎯 Ghost debug for container', id, {
  //   draggingNodeId,
  //   hasDraggingNode: !!draggingNode,
  //   isDragOver,
  //   shouldShowGhost,
  //   ghostNode: ghostNode?.name
  // });

  // Sync editName with data.name when it changes
  useEffect(() => {
    setEditName(data.name);
  }, [data.name]);

  const toggleMenu = useCallback(() => {
    setShowMenu(prev => !prev);
  }, []);

  const toggleDetails = useCallback(() => {
    setShowDetails(prev => !prev);
  }, []);

  const handleDelete = useCallback(() => {
    onDelete();
  }, [onDelete]);

  const handleToggleCompact = useCallback(() => {
    onToggleCompact();
  }, [onToggleCompact]);

  const handleConfigure = useCallback((resources: ResourceStats, envVars: Record<string, string>) => {
    if (onConfigure) {
      onConfigure(resources, envVars);
    }
  }, [onConfigure]);

  const handleContainerResourceConfig = useCallback((config: {
    resourceMode: 'auto' | 'manual';
    manualResourceLimits?: { cpu: string; memory: string };
  }) => {
    // This would need to be passed up to the parent component to update the container node
    console.log('Container resource config:', config);
    // For now, we'll need to add this to the onConfigure callback or create a new callback
    if (onConfigure) {
      // Pass the resource mode configuration along with the resources
      onConfigure(resources, {
        ...data.environmentVariables,
        '__resourceMode': config.resourceMode,
        '__manualCpuLimit': config.manualResourceLimits?.cpu || '',
        '__manualMemoryLimit': config.manualResourceLimits?.memory || ''
      });
    }
  }, [onConfigure, resources, data.environmentVariables]);

  const getContainerIcon = () => {
    switch (containerType) {
      case 'docker':
        return <Box className="h-5 w-5 text-blue-400" />;
      case 'kubernetes':
        return <Layers className="h-5 w-5 text-green-400" />;
      default:
        return <Server className="h-5 w-5 text-gray-400" />;
    }
  };

  // Removed getStatusColor - status not needed

  const headerHeight = 50;
  
  // Calculate how many items can fit based on container height
  const calculateItemsPerPage = useCallback(() => {
    const headerAndPaddingHeight = headerHeight + 60; // Header + padding + footer space
    const itemHeight = 80; // Approximate height of each contained node
    const availableHeight = height - headerAndPaddingHeight;
    const maxItems = Math.floor(availableHeight / itemHeight);
    return Math.max(1, maxItems); // At least 1 item per page
  }, [height]);
  
  const itemsPerPage = calculateItemsPerPage();

  // Calculate total resources from contained nodes
  const calculateAutoResources = useCallback(() => {
    let totalCpuUnits = 0;
    let totalMemoryMB = 0;

    containedNodes.forEach(node => {
      if (node.resources) {
        // Parse CPU (handle formats like "2 CPU", "1.5 cores", "500m")
        const cpuStr = node.resources.cpu.toLowerCase();
        if (cpuStr.includes('m')) {
          // Millicores (e.g., "500m" = 0.5 CPU)
          totalCpuUnits += parseInt(cpuStr.replace('m', '')) / 1000;
        } else {
          // Regular cores (e.g., "2 CPU", "1.5 cores")
          const cpuMatch = cpuStr.match(/(\d+(?:\.\d+)?)/);
          if (cpuMatch) {
            totalCpuUnits += parseFloat(cpuMatch[1]);
          }
        }

        // Parse Memory (handle formats like "512MB", "2GB", "1.5 GB")
        const memStr = node.resources.memory.toLowerCase();
        if (memStr.includes('gb')) {
          const memMatch = memStr.match(/(\d+(?:\.\d+)?)/);
          if (memMatch) {
            totalMemoryMB += parseFloat(memMatch[1]) * 1024;
          }
        } else if (memStr.includes('mb')) {
          const memMatch = memStr.match(/(\d+(?:\.\d+)?)/);
          if (memMatch) {
            totalMemoryMB += parseFloat(memMatch[1]);
          }
        }
      }
    });

    // Format the results
    const cpuText = totalCpuUnits >= 1 
      ? `${totalCpuUnits % 1 === 0 ? totalCpuUnits : totalCpuUnits.toFixed(1)} CPU${totalCpuUnits > 1 ? 's' : ''}`
      : `${Math.round(totalCpuUnits * 1000)}m`;
    
    const memoryText = totalMemoryMB >= 1024
      ? `${(totalMemoryMB / 1024).toFixed(1)} GB`
      : `${Math.round(totalMemoryMB)} MB`;

    return { cpu: cpuText, memory: memoryText, totalCpuUnits, totalMemoryMB };
  }, [containedNodes]);

  // Check for resource limit violations in manual mode
  const checkResourceLimits = useCallback(() => {
    if (data.resourceMode !== 'manual' || !data.manualResourceLimits) {
      return { hasViolation: false, violations: [] };
    }

    const autoResources = calculateAutoResources();
    const violations = [];

    // Parse manual limits
    const manualCpuStr = data.manualResourceLimits.cpu.toLowerCase();
    const manualMemStr = data.manualResourceLimits.memory.toLowerCase();
    
    let manualCpuUnits = 0;
    let manualMemoryMB = 0;

    // Parse manual CPU limit
    if (manualCpuStr.includes('m')) {
      manualCpuUnits = parseInt(manualCpuStr.replace('m', '')) / 1000;
    } else {
      const cpuMatch = manualCpuStr.match(/(\d+(?:\.\d+)?)/);
      if (cpuMatch) {
        manualCpuUnits = parseFloat(cpuMatch[1]);
      }
    }

    // Parse manual Memory limit
    if (manualMemStr.includes('gb')) {
      const memMatch = manualMemStr.match(/(\d+(?:\.\d+)?)/);
      if (memMatch) {
        manualMemoryMB = parseFloat(memMatch[1]) * 1024;
      }
    } else if (manualMemStr.includes('mb')) {
      const memMatch = manualMemStr.match(/(\d+(?:\.\d+)?)/);
      if (memMatch) {
        manualMemoryMB = parseFloat(memMatch[1]);
      }
    }

    // Check violations
    if (autoResources.totalCpuUnits > manualCpuUnits) {
      violations.push(`CPU: ${autoResources.cpu} dépasse la limite de ${data.manualResourceLimits.cpu}`);
    }
    
    if (autoResources.totalMemoryMB > manualMemoryMB) {
      violations.push(`Mémoire: ${autoResources.memory} dépasse la limite de ${data.manualResourceLimits.memory}`);
    }

    return { hasViolation: violations.length > 0, violations };
  }, [data.resourceMode, data.manualResourceLimits, calculateAutoResources]);

  // Get displayed resources based on mode
  const getDisplayedResources = useCallback(() => {
    if (data.resourceMode === 'auto' || !data.resourceMode) {
      return calculateAutoResources();
    } else {
      // Manual mode - show manual limits
      return {
        cpu: data.manualResourceLimits?.cpu || data.resources.cpu,
        memory: data.manualResourceLimits?.memory || data.resources.memory
      };
    }
  }, [data.resourceMode, data.manualResourceLimits, data.resources, calculateAutoResources]);

  // Memoize expensive calculations to prevent re-renders and flickering
  const autoResources = useMemo(() => calculateAutoResources(), [calculateAutoResources]);
  
  const displayedResources = useMemo(() => {
    if (data.resourceMode === 'auto' || !data.resourceMode) {
      return autoResources;
    } else {
      // Manual mode - show manual limits
      return {
        cpu: data.manualResourceLimits?.cpu || data.resources.cpu,
        memory: data.manualResourceLimits?.memory || data.resources.memory
      };
    }
  }, [data.resourceMode, data.manualResourceLimits, data.resources, autoResources]);
  
  const resourceLimits = useMemo(() => checkResourceLimits(), [checkResourceLimits]);

  // Debounce resize calls to prevent flickering
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleResize = useCallback((newWidth: number, newHeight: number) => {
    // Clear previous timeout
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    
    // Debounce the resize call
    resizeTimeoutRef.current = setTimeout(() => {
      if (onResize && data.id) {
        onResize(data.id, newWidth, newHeight);
        
        // Reset current page if it's out of bounds after resize
        const newItemsPerPage = Math.max(1, Math.floor((newHeight - 110) / 80));
        const maxPages = Math.ceil(containedNodes.length / newItemsPerPage);
        if (currentPage >= maxPages) {
          setCurrentPage(Math.max(0, maxPages - 1));
        }
      }
    }, 50); // 50ms debounce
  }, [onResize, data.id, containedNodes.length, currentPage]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  // Calculate if mouse is over container during drag
  useEffect(() => {
    if (!draggingNodeId || !mousePosition || !containerRef.current) {
      if (isDragOver) {
        console.log('🎯 Clearing isDragOver for container:', id, 'no drag or mouse position');
        setIsDragOver(false);
      }
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const isMouseOverContainer = 
      mousePosition.x >= rect.left &&
      mousePosition.x <= rect.right &&
      mousePosition.y >= rect.top &&
      mousePosition.y <= rect.bottom;

    if (isMouseOverContainer !== isDragOver && draggingNodeId !== id) {
      console.log('🎯 Mouse over container changed:', id, 'isOver:', isMouseOverContainer, 'mousePos:', mousePosition, 'rect:', rect);
      setIsDragOver(isMouseOverContainer);
    }
  }, [draggingNodeId, mousePosition, isDragOver, id]);

  // Debug: Log des données du conteneur
  console.log('NestedContainerNode render:', {
    name,
    containedNodesCount: containedNodes.length,
    containedNodes: containedNodes.map(n => ({ id: n.id, name: n.name }))
  });

  return (
    <div
      ref={containerRef}
      className={cn(
        'bg-slate-800/90 backdrop-blur-sm border-2 rounded-lg shadow-xl transition-all duration-200 relative',
        selected ? 'border-blue-500 shadow-blue-500/20' : 'border-slate-600',
        'hover:border-slate-500',
        isDragOver && 'border-green-500 shadow-green-500/30 bg-green-900/10'
      )}
      style={{ width, height }}
    >
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-slate-600 border-2 border-slate-400 hover:bg-blue-500 hover:border-blue-400 transition-colors"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-slate-600 border-2 border-slate-400 hover:bg-green-500 hover:border-green-400 transition-colors"
      />

      {/* Container Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700 rounded-t-lg">
        <div className="flex items-center gap-3">
          {getContainerIcon()}
          <div>
            {isEditingName ? (
              <input
                ref={nameInputRef}
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => {
                  setIsEditingName(false);
                  if (editName.trim() && editName !== data.name && onNameChange) {
                    onNameChange(data.id, editName.trim());
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditingName(false);
                    if (editName.trim() && editName !== data.name && onNameChange) {
                      onNameChange(data.id, editName.trim());
                    }
                  } else if (e.key === 'Escape') {
                    setEditName(data.name);
                    setIsEditingName(false);
                  }
                }}
                className="bg-transparent border-none outline-none font-medium text-slate-200 text-sm w-full min-w-0"
                autoFocus
                onMouseDown={(e) => e.stopPropagation()}
              />
            ) : (
              <h3 
                className="font-semibold text-slate-100 text-base cursor-text hover:text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onNameChange) {
                    setIsEditingName(true);
                    setEditName(data.name);
                  }
                }}
                title="Cliquer pour éditer le nom"
              >
                {name}
              </h3>
            )}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge 
                variant="secondary" 
                className="text-xs"
              >
                {containerType}
              </Badge>
              {replicas && (
                <Badge variant="outline" className="text-xs">
                  {replicas} replicas
                </Badge>
              )}
              {/* Services count */}
              <Badge 
                variant="success" 
                className="text-xs bg-green-600/20 text-green-300 border-green-500/30"
              >
                {containedNodes.length} services
              </Badge>
              {/* Resources info with mode indicator */}
              <div className="flex items-center gap-1.5 text-xs">
                {resourceLimits.hasViolation ? (
                  <div className="flex items-center gap-1 text-red-400" title={resourceLimits.violations.join('\n')}>
                    <span className="flex items-center gap-1">⚠️ {displayedResources.cpu}</span>
                    <span className="flex items-center gap-1">💾 {displayedResources.memory}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="flex items-center gap-1">📊 {displayedResources.cpu}</span>
                    <span className="flex items-center gap-1">💾 {displayedResources.memory}</span>
                  </div>
                )}
                {data.resourceMode === 'auto' || !data.resourceMode ? (
                  <Badge variant="outline" className="text-xs text-blue-300 border-blue-500/30 bg-blue-600/10">
                    AUTO
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs text-purple-300 border-purple-500/30 bg-purple-600/10">
                    MANUEL
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleDetails}
            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-all duration-200 hover:scale-105"
            title="Informations détaillées"
          >
            <Info className="h-4 w-4" />
          </button>
          <button
            onClick={handleToggleCompact}
            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-all duration-200 hover:scale-105"
            title={isCompact ? 'Agrandir' : 'Réduire'}
          >
            {isCompact ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={toggleMenu}
            className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-all duration-200 hover:scale-105"
            title="Plus d'options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Container Content Area */}
      <div className="p-2 relative" style={{ height: height - headerHeight }}>
        {/* Container Description */}
        {!isCompact && (
          <p className="text-xs text-slate-400 mb-2 line-clamp-2">
            {description}
          </p>
        )}

        {/* Contained Nodes Area - drag handling now done at container level */}
        <div className="relative h-full border-2 border-dashed border-slate-600 rounded-lg p-2 transition-colors duration-200 hover:border-slate-500">
          {containedNodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 group">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Plus className="h-12 w-12 relative z-10 text-slate-500 group-hover:text-slate-300 transition-colors duration-300" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">Glissez des composants ici</p>
                <p className="text-xs text-slate-500 mt-1">pour les containeriser</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 relative">
              {/* Services compacts avec pagination */}
              {containedNodes.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage).map((node) => (
                <div
                  key={node.id}
                  className="bg-gradient-to-r from-slate-700/70 to-slate-600/50 border border-slate-500/40 rounded-xl p-3 flex items-center gap-3 relative hover:from-slate-600/70 hover:to-slate-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-slate-900/50"
                >
                  {/* Icon catégorie compact */}
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base shadow-lg transition-all duration-300 hover:scale-110 ${
                      node.category === 'frontend' ? 'bg-gradient-to-br from-blue-500/30 to-blue-600/20 text-blue-300 border border-blue-500/30' :
                      node.category === 'backend' ? 'bg-gradient-to-br from-green-500/30 to-green-600/20 text-green-300 border border-green-500/30' :
                      node.category === 'database' ? 'bg-gradient-to-br from-purple-500/30 to-purple-600/20 text-purple-300 border border-purple-500/30' :
                      node.category === 'devops' ? 'bg-gradient-to-br from-orange-500/30 to-orange-600/20 text-orange-300 border border-orange-500/30' :
                      'bg-gradient-to-br from-gray-500/30 to-gray-600/20 text-gray-300 border border-gray-500/30'
                    }`}>
                      {node.category === 'frontend' && '🎨'}
                      {node.category === 'backend' && '⚙️'}
                      {node.category === 'database' && '🗄️'}
                      {node.category === 'devops' && '🚀'}
                      {!['frontend', 'backend', 'database', 'devops'].includes(node.category) && '📦'}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header compact */}
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-sm shadow-green-400/50"></div>
                      <h4 className="text-sm font-semibold text-slate-100 truncate">{node.name}</h4>
                    </div>
                    
                    {/* Infos compactes */}
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      <Badge 
                        variant="secondary" 
                        className="text-xs py-1 px-2 bg-slate-600/50 text-slate-300 border-slate-500/50 rounded-md"
                      >
                        {node.category}
                      </Badge>
                      {node.resources && (
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-blue-300 flex items-center gap-1">📊 <span className="font-medium">{node.resources.cpu}</span></span>
                          <span className="text-green-300 flex items-center gap-1">💾 <span className="font-medium">{node.resources.memory}</span></span>
                          {node.resources.storage && (
                            <span className="text-purple-300 flex items-center gap-1">💿 <span className="font-medium">{node.resources.storage}</span></span>
                          )}
                          {node.resources.network && (
                            <span className="text-yellow-300 flex items-center gap-1">🌐 <span className="font-medium">{node.resources.network}</span></span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions du composant */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Configurer le composant */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNodeConfig(node.id);
                      }}
                      className="p-2 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded-lg transition-all duration-200 hover:scale-110"
                      title="Configurer le composant"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    
                    {/* Retirer du conteneur */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onRemoveFromContainer && data.id) {
                          onRemoveFromContainer(data.id, node.id);
                        }
                      }}
                      className="p-2 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all duration-200 hover:scale-110"
                      title="Retirer du conteneur"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Ghost preview during drag */}
              {isDragOver && ghostNode && (
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-dashed border-green-500/50 rounded-xl p-3 flex items-center gap-3 relative animate-pulse">
                  {/* Icon catégorie ghost */}
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base opacity-70 ${
                      ghostNode.category === 'frontend' ? 'bg-gradient-to-br from-blue-500/30 to-blue-600/20 text-blue-300 border border-blue-500/30' :
                      ghostNode.category === 'backend' ? 'bg-gradient-to-br from-green-500/30 to-green-600/20 text-green-300 border border-green-500/30' :
                      ghostNode.category === 'database' ? 'bg-gradient-to-br from-purple-500/30 to-purple-600/20 text-purple-300 border border-purple-500/30' :
                      ghostNode.category === 'devops' ? 'bg-gradient-to-br from-orange-500/30 to-orange-600/20 text-orange-300 border border-orange-500/30' :
                      'bg-gradient-to-br from-gray-500/30 to-gray-600/20 text-gray-300 border border-gray-500/30'
                    }`}>
                      {ghostNode.category === 'frontend' && '🎨'}
                      {ghostNode.category === 'backend' && '⚙️'}
                      {ghostNode.category === 'database' && '🗄️'}
                      {ghostNode.category === 'devops' && '🚀'}
                      {!['frontend', 'backend', 'database', 'devops'].includes(ghostNode.category) && '📦'}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-sm shadow-green-400/50"></div>
                      <h4 className="text-sm font-semibold text-green-300 truncate">{ghostNode.name}</h4>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs">
                      <Badge 
                        variant="secondary" 
                        className="text-xs py-1 px-2 bg-green-600/30 text-green-300 border-green-500/50 rounded-md"
                      >
                        {ghostNode.category}
                      </Badge>
                      <span className="text-green-400 text-xs font-medium">
                        👻 Prévisualisation - Relâchez pour intégrer
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Pagination dynamique selon la taille du container */}
              {containedNodes.length > itemsPerPage && (
                <div className="flex items-center justify-between pt-3 border-t border-slate-600/50 bg-slate-800/30 rounded-lg px-3 py-2 mt-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/50 transition-all duration-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  <div className="text-sm text-slate-300 font-medium bg-slate-700/50 px-3 py-1 rounded-full">
                    {currentPage * itemsPerPage + 1}-{Math.min((currentPage + 1) * itemsPerPage, containedNodes.length)} / {containedNodes.length}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(Math.ceil(containedNodes.length / itemsPerPage) - 1, currentPage + 1))}
                    disabled={currentPage >= Math.ceil(containedNodes.length / itemsPerPage) - 1}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700/50 transition-all duration-200"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Optional detailed stats panel - only when details button is pressed */}
        {showDetails && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 shadow-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-300 font-medium flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    Configuration détaillée
                  </span>
                  <div className="text-slate-100 space-y-1">
                    {ports.length > 0 && (
                      <div className="text-xs text-slate-300">
                        Ports: <span className="font-mono bg-slate-700/50 px-2 py-1 rounded">{ports.join(', ')}</span>
                      </div>
                    )}
                    {replicas && (
                      <div className="text-xs text-slate-300">
                        Répliques: <span className="font-medium">{replicas}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-slate-300 font-medium flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    Environnement
                  </span>
                  <div className="text-slate-100 space-y-1 text-xs">
                    <div>Status: <span className="text-green-300 font-medium">Active</span></div>
                    <div>Type: <span className="font-medium capitalize">{containerType}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {showMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute top-14 right-4 z-50 bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-xl shadow-2xl py-2 min-w-[180px]">
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200 rounded-lg mx-1"
              onClick={() => {
                setShowMenu(false);
                setShowConfigModal(true);
              }}
            >
              <Settings className="h-4 w-4" />
              Paramètres
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200 rounded-lg mx-1"
              onClick={() => {
                setShowMenu(false);
                setShowContainerResourceModal(true);
              }}
            >
              <Database className="h-4 w-4" />
              Ressources & Limites
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200 rounded-lg mx-1"
              onClick={() => {
                setShowMenu(false);
                setShowPortVolumeModal(true);
              }}
            >
              <Server className="h-4 w-4" />
              Ports & Volumes
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-all duration-200 rounded-lg mx-1"
              onClick={() => {
                setShowMenu(false);
                // TODO: Show container logs
              }}
            >
              <FileText className="h-4 w-4" />
              Logs
            </button>
            <div className="h-px bg-slate-700/50 my-2 mx-2" />
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 rounded-lg mx-1"
              onClick={() => {
                setShowMenu(false);
                handleDelete();
              }}
            >
              <X className="h-4 w-4" />
              Supprimer
            </button>
          </div>
        </>
      )}

      {/* Resource Configuration Modal */}
      <ResourceConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSave={handleConfigure}
        initialResources={resources}
        initialEnvVars={data.environmentVariables || {}}
        componentName={name}
      />

      {/* Container Resource Configuration Modal */}
      <ContainerResourceModal
        isOpen={showContainerResourceModal}
        onClose={() => setShowContainerResourceModal(false)}
        onSave={handleContainerResourceConfig}
        containerName={name}
        currentMode={data.resourceMode}
        currentManualLimits={data.manualResourceLimits}
        autoCalculatedResources={autoResources}
        containedNodesCount={containedNodes.length}
      />

      {/* Port & Volume Configuration Modal */}
      <PortVolumeModal
        isOpen={showPortVolumeModal}
        onClose={() => setShowPortVolumeModal(false)}
        onSave={(ports, volumes) => {
          // TODO: Handle ports and volumes save
          console.log('Ports:', ports, 'Volumes:', volumes);
        }}
        initialPorts={ports.map((port, index) => ({
          id: `port-${index}`,
          containerPort: port,
          hostPort: port,
          protocol: 'tcp' as const,
          description: `Port ${port}`
        }))}
        initialVolumes={[]}
        containerName={name}
        containerType={containerType}
      />

      {/* Configuration Modal for Individual Components */}
      {selectedNodeConfig && (() => {
        const selectedNode = containedNodes.find(n => n.id === selectedNodeConfig);
        return selectedNode ? (
          <ComponentConfigModal
            isOpen={true}
            nodeName={`${selectedNode.name} (dans ${name})`}
            initialResources={selectedNode.resources || { cpu: '1 core', memory: '512MB' }}
            initialEnvVars={selectedNode.environmentVariables || {}}
            onSave={(resources, envVars) => {
              // TODO: Update individual component configuration
              console.log('Update node config:', selectedNode.name, resources, envVars);
              setSelectedNodeConfig(null);
            }}
            onClose={() => setSelectedNodeConfig(null)}
          />
        ) : null;
      })()}

      {/* Resize Handle */}
      <ResizeHandle
        onResize={handleResize}
        initialWidth={width}
        initialHeight={height}
        minWidth={300}
        minHeight={200}
        maxWidth={1000}
        maxHeight={800}
        disabled={data.isReadOnly}
      />
    </div>
  );
});

NestedContainerNode.displayName = 'NestedContainerNode';