'use client';

import { useCallback, useMemo } from 'react';
import { NodeData } from './CanvasNode';
import { ModernContainerData } from './ModernContainer';

/**
 * Hook pour gérer les données et actions des containers modernisés
 */
export const useContainerData = (
  nodes: NodeData[],
  setNodes: (updater: (nodes: NodeData[]) => NodeData[]) => void
) => {

  // Convertir les nodes existants vers le format moderne
  const convertToModernContainer = useCallback((node: NodeData): ModernContainerData => {
    // Récupération des données depuis environmentVariables (ancien système)
    const env = node.environmentVariables || {};
    const resourceMode = (env.__resourceMode as 'auto' | 'manual') || 'auto';
    const manualCpuLimit = env.__manualCpuLimit as string;
    const manualMemoryLimit = env.__manualMemoryLimit as string;

    return {
      ...node,
      isContainer: true,
      containerType: (node as any).containerType || 'docker',
      containedNodes: (node as any).containedNodes || [],
      resourceMode,
      manualLimits: resourceMode === 'manual' && manualCpuLimit && manualMemoryLimit 
        ? { cpu: manualCpuLimit, memory: manualMemoryLimit }
        : undefined,
      ports: (node as any).ports || [],
      volumes: (node as any).volumes || [],
      networks: (node as any).networks || [],
      status: (node as any).status || 'running',
      replicas: (node as any).replicas || 1,
      isCompact: node.isCompact ?? false,
      width: node.width || 400,
      height: node.height || 300,
      
      // Actions
      onToggleCompact: (id: string) => {
        setNodes(prev => prev.map(n => 
          n.id === id ? { ...n, isCompact: !n.isCompact } : n
        ));
      },
      
      onDelete: (id: string) => {
        setNodes(prev => prev.filter(n => n.id !== id));
      },
      
      onResourceModeChange: (id: string, mode: 'auto' | 'manual', limits?: { cpu: string; memory: string }) => {
        setNodes(prev => prev.map(n => {
          if (n.id === id) {
            const updatedEnv = { ...(n.environmentVariables || {}) };
            updatedEnv.__resourceMode = mode;
            
            if (mode === 'manual' && limits) {
              updatedEnv.__manualCpuLimit = limits.cpu;
              updatedEnv.__manualMemoryLimit = limits.memory;
            } else {
              delete updatedEnv.__manualCpuLimit;
              delete updatedEnv.__manualMemoryLimit;
            }
            
            return {
              ...n,
              environmentVariables: updatedEnv
            };
          }
          return n;
        }));
      },
      
      onRemoveFromContainer: (containerId: string, nodeId: string) => {
        setNodes(prev => prev.map(container => {
          if (container.id === containerId && (container as any).isContainer) {
            const containedNodes = (container as any).containedNodes || [];
            return {
              ...container,
              containedNodes: containedNodes.filter((n: NodeData) => n.id !== nodeId)
            } as any;
          }
          return container;
        }));
      },
      
      onResize: (id: string, width: number, height: number) => {
        setNodes(prev => prev.map(n => 
          n.id === id ? { ...n, width, height } : n
        ));
      },
      
      onNodeSelect: (nodeId: string) => {
        console.log('Node selected for configuration:', nodeId);
        // Ici on pourrait ouvrir un modal de configuration
      }
    };
  }, [setNodes]);

  // Calculer les ressources automatiques pour un container
  const calculateAutoResources = useCallback((containedNodes: NodeData[]) => {
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
  }, []);

  // Identifier les containers modernes dans la liste des nodes
  const containerNodes = useMemo(() => {
    return nodes
      .filter(node => (node as any).isContainer)
      .map(convertToModernContainer);
  }, [nodes, convertToModernContainer]);

  // Mise à jour d'un container spécifique
  const updateContainer = useCallback((containerId: string, updates: Partial<ModernContainerData>) => {
    setNodes(prev => prev.map(node => {
      if (node.id === containerId) {
        return { ...node, ...updates };
      }
      return node;
    }));
  }, [setNodes]);

  // Ajouter un node à un container
  const addToContainer = useCallback((containerId: string, nodeToAdd: NodeData) => {
    setNodes(prev => prev.map(container => {
      if (container.id === containerId && (container as any).isContainer) {
        const containedNodes = (container as any).containedNodes || [];
        
        // Vérifier que le node n'est pas déjà dans le container
        if (containedNodes.find((n: NodeData) => n.id === nodeToAdd.id)) {
          return container;
        }
        
        return {
          ...container,
          containedNodes: [...containedNodes, nodeToAdd]
        } as any;
      }
      return container;
    }));
  }, [setNodes]);

  // Créer un nouveau container moderne
  const createModernContainer = useCallback((
    name: string, 
    containerType: 'docker' | 'kubernetes' = 'docker',
    position: { x: number; y: number } = { x: 0, y: 0 }
  ) => {
    const newContainer: ModernContainerData = {
      id: `container-${Date.now()}`,
      name,
      category: 'devops',
      description: `${containerType} container for microservices`,
      setupTimeHours: 1,
      difficulty: 'intermediate',
      pricing: 'free',
      isMainTechnology: true,
      isContainer: true,
      containerType,
      containedNodes: [],
      resourceMode: 'auto',
      ports: containerType === 'docker' ? ['3000'] : ['80', '443'],
      volumes: [],
      networks: [],
      status: 'running',
      replicas: containerType === 'kubernetes' ? 3 : 1,
      isCompact: false,
      width: 400,
      height: 300,
      position,
      
      // Actions (seront redéfinies par convertToModernContainer)
      onToggleCompact: () => {},
      onDelete: () => {},
      onResourceModeChange: () => {},
      onRemoveFromContainer: () => {},
      onResize: () => {},
      onNodeSelect: () => {}
    };

    setNodes(prev => [...prev, newContainer as any]);
    return newContainer;
  }, [setNodes]);

  return {
    containerNodes,
    convertToModernContainer,
    calculateAutoResources,
    updateContainer,
    addToContainer,
    createModernContainer
  };
};