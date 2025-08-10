'use client';

import { memo, useCallback } from 'react';
import { NodeProps } from '@xyflow/react';
import { ModernContainer, ModernContainerData } from './ModernContainer';
import { NodeData } from './CanvasNode';
import { ContainerNodeData } from './types/ContainerTypes';

/**
 * Adaptateur pour intégrer ModernContainer dans ReactFlow
 * Convertit les données existantes vers le nouveau format
 */
export const ModernContainerAdapter = memo<NodeProps<NodeData>>(({ 
  data,
  selected = false,
  dragging = false
}) => {
  // Convertir les données vers le format moderne avec callbacks simplifiés
  const convertToModernContainer = useCallback((): ModernContainerData => {
    // Récupération des données depuis environmentVariables (ancien système)
    const env = data.environmentVariables || {};
    const resourceMode = (env.__resourceMode as 'auto' | 'manual') || 'auto';
    const manualCpuLimit = env.__manualCpuLimit as string;
    const manualMemoryLimit = env.__manualMemoryLimit as string;
    
    // Tailles par défaut selon le type
    const containerType = (data as ContainerNodeData).containerType || 'docker';
    const getDefaultSize = () => {
      switch (containerType) {
        case 'docker':
          return { width: 380, height: 280 };
        case 'kubernetes':
          return { width: 450, height: 350 };
        default:
          return { width: 400, height: 300 };
      }
    };
    
    const defaultSize = getDefaultSize();

    return {
      ...data,
      isContainer: true,
      containerType: (data as ContainerNodeData).containerType || 'docker',
      containedNodes: (data as ContainerNodeData).containedNodes || [],
      resourceMode,
      manualLimits: resourceMode === 'manual' && manualCpuLimit && manualMemoryLimit 
        ? { cpu: manualCpuLimit, memory: manualMemoryLimit }
        : undefined,
      ports: (data as ContainerNodeData).ports || [],
      volumes: (data as ContainerNodeData).volumes || [],
      networks: (data as ContainerNodeData).networks || [],
      status: (data as ContainerNodeData).status || 'running',
      replicas: (data as ContainerNodeData).replicas || 1,
      isCompact: data.isCompact ?? false,
      width: data.width || defaultSize.width,
      height: data.height || defaultSize.height,
      
      // Actions simplifiées (utilisant les callbacks existants du système)
      onToggleCompact: (id: string) => {
        if (data.onToggleMode) {
          data.onToggleMode(id);
        }
      },
      
      onDelete: (id: string) => {
        if (data.onDelete) {
          data.onDelete(id);
        }
      },
      
      onResourceModeChange: (id: string, mode: 'auto' | 'manual', limits?: { cpu: string; memory: string }) => {
        // Utiliser le système d'environmentVariables existant
        const updatedEnv = { ...(data.environmentVariables || {}) };
        updatedEnv.__resourceMode = mode;
        
        if (mode === 'manual' && limits) {
          updatedEnv.__manualCpuLimit = limits.cpu;
          updatedEnv.__manualMemoryLimit = limits.memory;
        } else {
          delete updatedEnv.__manualCpuLimit;
          delete updatedEnv.__manualMemoryLimit;
        }
        
        // Mettre à jour via le callback existant
        if (data.onConfigure) {
          data.onConfigure(id, data.resources || { cpu: '1 CPU', memory: '512MB' }, updatedEnv);
        }
      },
      
      onRemoveFromContainer: (containerId: string, nodeId: string) => {
        if (data.onRemoveFromContainer) {
          data.onRemoveFromContainer(containerId, nodeId);
        }
      },
      
      onResize: (id: string, width: number, height: number) => {
        if (data.onResize) {
          data.onResize(id, width, height);
        }
      },
      
      onNodeSelect: (nodeId: string) => {
        if (data.onNodeSelect) {
          data.onNodeSelect(nodeId);
        }
        console.log('Node selected for configuration:', nodeId);
      }
    };
  }, [data]);
  
  // Convertir vers le format moderne
  const modernData = convertToModernContainer();
  
  return (
    <ModernContainer 
      data={modernData}
      selected={selected}
      dragging={dragging}
      id={data.id}
      type="modernContainer"
      xPos={data.position?.x || 0}
      yPos={data.position?.y || 0}
      zIndex={0}
      isConnectable={true}
      targetPosition={undefined}
      sourcePosition={undefined}
    />
  );
});

ModernContainerAdapter.displayName = 'ModernContainerAdapter';