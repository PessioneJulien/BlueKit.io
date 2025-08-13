'use client';

import { NodeData, ResourceStats } from './CanvasNode';
import { ContainerNodeData } from './ContainerNode';

export interface ContainerDropZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export class ContainerManager {
  /**
   * Create a new Docker container
   */
  static createDockerContainer(
    id: string,
    position: { x: number; y: number },
    containedNodes: NodeData[] = [],
    viewMode: 'nested' = 'nested'
  ): ContainerNodeData {
    const baseContainer = {
      id,
      name: 'Docker Container',
      category: 'devops',
      description: 'Docker container running multiple services',
      setupTimeHours: 2,
      difficulty: 'intermediate',
      pricing: 'free',
      isMainTechnology: true,
      isContainer: true,
      containerType: 'docker',
      // status: 'running', // Removed - not useful
      resources: {
        cpu: '1 CPU',
        memory: '512MB'
      },
      position,
      isCompact: false,
      onDelete: () => {},
      onToggleCompact: () => {}
    } as const;

    // Nested view with adjusted default size (using old max as new default)
    return {
      ...baseContainer,
      containedNodes,
      ports: ['3000', '5000'],
      width: 550, // Ancien max devient nouveau défaut
      height: 450
    };
  }

  /**
   * Create a new Kubernetes cluster
   */
  static createKubernetesCluster(
    id: string,
    position: { x: number; y: number },
    containedNodes: NodeData[] = [],
    viewMode: 'nested' = 'nested'
  ): ContainerNodeData {
    const baseCluster = {
      id,
      name: 'Kubernetes Cluster',
      category: 'devops',
      description: 'Kubernetes cluster orchestrating multiple containers',
      setupTimeHours: 5,
      difficulty: 'expert',
      pricing: 'free',
      isMainTechnology: true,
      isContainer: true,
      containerType: 'kubernetes',
      networks: ['cluster-network', 'service-mesh'],
      replicas: 3,
      // status: 'running', // Removed - not useful
      resources: {
        cpu: '4 CPU',
        memory: '8GB'
      },
      position,
      isCompact: false,
      onDelete: () => {},
      onToggleCompact: () => {}
    } as const;

    // Nested view with adjusted default size (using old max as new default)
    return {
      ...baseCluster,
      containedNodes,
      ports: ['80', '443', '8080'],
      width: 600, // Ancien max devient nouveau défaut
      height: 500
    };
  }

  /**
   * Check if a node can be contained in a container
   */
  static canContain(container: ContainerNodeData, node: NodeData): boolean {
    // Don't allow containers inside containers for now
    if ('isContainer' in node && node.isContainer) {
      return false;
    }

    // Docker containers can contain most services
    if (container.containerType === 'docker') {
      return ['frontend', 'backend', 'database', 'testing', 'mobile'].includes(node.category);
    }

    // Kubernetes can contain other containers and services
    if (container.containerType === 'kubernetes') {
      return true;
    }

    // Custom containers (no specific containerType or other types) can contain any component
    // This allows containers created without Docker/Kubernetes badges to accept components
    return true;
  }

  /**
   * Check if a node position is inside a container's bounds
   */
  static isNodeInsideContainer(
    nodePosition: { x: number; y: number },
    containerPosition: { x: number; y: number },
    containerSize: { width: number; height: number },
    nodeSize: { width: number; height: number } = { width: 200, height: 80 }
  ): boolean {
    const nodeLeft = nodePosition.x;
    const nodeRight = nodePosition.x + nodeSize.width;
    const nodeTop = nodePosition.y;
    const nodeBottom = nodePosition.y + nodeSize.height;

    const containerLeft = containerPosition.x;
    const containerRight = containerPosition.x + containerSize.width;
    const containerTop = containerPosition.y;
    const containerBottom = containerPosition.y + containerSize.height;

    // Check if the node is mostly inside the container (at least 70% overlap)
    const overlapLeft = Math.max(nodeLeft, containerLeft);
    const overlapRight = Math.min(nodeRight, containerRight);
    const overlapTop = Math.max(nodeTop, containerTop);
    const overlapBottom = Math.min(nodeBottom, containerBottom);

    if (overlapLeft >= overlapRight || overlapTop >= overlapBottom) {
      return false; // No overlap
    }

    const overlapArea = (overlapRight - overlapLeft) * (overlapBottom - overlapTop);
    const nodeArea = nodeSize.width * nodeSize.height;
    const overlapPercentage = overlapArea / nodeArea;

    console.log('🎯 Collision detection:', {
      nodePos: nodePosition,
      containerPos: containerPosition,
      containerSize,
      nodeSize,
      overlapPercentage: Math.round(overlapPercentage * 100) + '%',
      threshold: '50%',
      result: overlapPercentage >= 0.5
    });

    return overlapPercentage >= 0.5; // At least 50% inside (reduced from 70%)
  }

  /**
   * Update a container with new contained nodes
   */
  static updateContainer(
    container: ContainerNodeData,
    newContainedNodes: NodeData[]
  ): ContainerNodeData {
    // Filter nodes that can actually be contained
    const validNodes = newContainedNodes.filter(node => 
      this.canContain(container, node)
    );

    // Calculate new size based on content (using adjusted larger base sizes)
    const minWidth = container.containerType === 'kubernetes' ? 600 : 550;
    const minHeight = container.containerType === 'kubernetes' ? 500 : 450;
    
    let newWidth = minWidth;
    let newHeight = minHeight;

    if (validNodes.length > 0) {
      // Add height for each contained node
      newHeight = Math.max(minHeight, minHeight + (validNodes.length * 80)); // Plus d'espace par service
      
      // Adjust width if needed for Kubernetes clusters
      if (container.containerType === 'kubernetes') {
        newWidth = Math.max(600, minWidth + 40);
        newHeight = Math.max(500, newHeight);
      }
    }

    // Update ports if container has web services
    const webServices = validNodes.filter(node => 
      node.category === 'frontend' || node.category === 'backend'
    );
    
    let ports = container.ports || [];
    if (webServices.length > 0 && ports.length === 0) {
      ports = container.containerType === 'docker' 
        ? ['3000', '5000'] 
        : ['80', '443', '8080'];
    }

    // Calculate aggregated resources
    const aggregatedResources = this.calculateAggregatedResources(validNodes);

    // ALWAYS preserve existing dimensions if they exist - never recalculate for existing containers
    const finalWidth = container.width || newWidth;
    const finalHeight = container.height || newHeight;
    
    console.log('📦 ContainerManager.updateContainer:', container.id, {
      existingWidth: container.width,
      existingHeight: container.height,
      calculatedWidth: newWidth,
      calculatedHeight: newHeight,
      finalWidth,
      finalHeight,
      preservingExisting: !!container.width || !!container.height
    });

    return {
      ...container,
      containedNodes: validNodes,
      // ALWAYS preserve existing dimensions - they are user-defined
      width: finalWidth,
      height: finalHeight,
      ports,
      resources: aggregatedResources
    };
  }

  /**
   * Get drop zones for all containers in a list of nodes
   */
  static getDropZones(nodes: Array<NodeData & { position: { x: number; y: number }; width?: number; height?: number }>): ContainerDropZone[] {
    return nodes
      .filter(node => 'isContainer' in node && node.isContainer)
      .map(container => ({
        id: container.id,
        x: container.position.x,
        y: container.position.y,
        width: container.width || 400,
        height: container.height || 300
      }));
  }

  /**
   * Find which container (if any) a node is being dropped into
   */
  static findTargetContainer(
    nodePosition: { x: number; y: number },
    dropZones: ContainerDropZone[],
    nodeSize: { width: number; height: number } = { width: 200, height: 80 }
  ): string | null {
    for (const zone of dropZones) {
      if (this.isNodeInsideContainer(
        nodePosition,
        { x: zone.x, y: zone.y },
        { width: zone.width, height: zone.height },
        nodeSize
      )) {
        return zone.id;
      }
    }
    return null;
  }

  /**
   * Calculate optimal position for a node inside a container
   */
  static calculateContainedNodePosition(
    container: ContainerNodeData,
    existingNodes: NodeData[]
  ): { x: number; y: number } {
    const containerPadding = 20;
    const nodeSpacing = 10;
    const nodeHeight = 80;

    const startY = container.position.y + 100; // Below header
    const startX = container.position.x + containerPadding;

    // Stack nodes vertically
    const nodeCount = existingNodes.length;
    const newY = startY + (nodeCount * (nodeHeight + nodeSpacing));

    return {
      x: startX,
      y: newY
    };
  }

  /**
   * Calculate aggregated resources for contained nodes
   */
  static calculateAggregatedResources(containedNodes: NodeData[]): ResourceStats {
    if (containedNodes.length === 0) {
      return {
        cpu: '0.5 cores',
        memory: '256MB',
        storage: '1GB',
        network: '10Mbps'
      };
    }

    let totalCpu = 0;
    let totalMemory = 0;
    let totalStorage = 0;
    let totalNetwork = 0;

    containedNodes.forEach(node => {
      if (node.resources) {
        // Parse CPU (extract number from strings like "2 cores", "1 CPU")
        const cpuMatch = node.resources.cpu.match(/(\d+(?:\.\d+)?)/);
        if (cpuMatch) {
          totalCpu += parseFloat(cpuMatch[1]);
        }

        // Parse Memory (convert to MB)
        const memoryMatch = node.resources.memory.match(/(\d+(?:\.\d+)?)([GM]B)/);
        if (memoryMatch) {
          const value = parseFloat(memoryMatch[1]);
          const unit = memoryMatch[2];
          totalMemory += unit === 'GB' ? value * 1024 : value;
        }

        // Parse Storage (convert to GB)
        if (node.resources.storage) {
          const storageMatch = node.resources.storage.match(/(\d+(?:\.\d+)?)([GMT]B)/);
          if (storageMatch) {
            const value = parseFloat(storageMatch[1]);
            const unit = storageMatch[2];
            let gbValue = value;
            if (unit === 'MB') gbValue = value / 1024;
            if (unit === 'TB') gbValue = value * 1024;
            totalStorage += gbValue;
          }
        }

        // Parse Network (convert to Mbps)
        if (node.resources.network) {
          const networkMatch = node.resources.network.match(/(\d+(?:\.\d+)?)([GM]bps)/);
          if (networkMatch) {
            const value = parseFloat(networkMatch[1]);
            const unit = networkMatch[2];
            totalNetwork += unit === 'Gbps' ? value * 1000 : value;
          }
        }
      }
    });

    // Add container overhead (20% increase)
    const overhead = 1.2;
    totalCpu *= overhead;
    totalMemory *= overhead;
    totalStorage *= overhead;
    totalNetwork *= overhead;

    // Format results
    const formatCpu = (cpu: number): string => {
      if (cpu >= 1) return `${Math.ceil(cpu)} cores`;
      return `${Math.ceil(cpu * 1000)}m CPU`;
    };

    const formatMemory = (memory: number): string => {
      if (memory >= 1024) return `${Math.ceil(memory / 1024)}GB`;
      return `${Math.ceil(memory)}MB`;
    };

    const formatStorage = (storage: number): string => {
      if (storage >= 1024) return `${Math.ceil(storage / 1024)}TB`;
      return `${Math.ceil(storage)}GB`;
    };

    const formatNetwork = (network: number): string => {
      if (network >= 1000) return `${Math.ceil(network / 1000)}Gbps`;
      return `${Math.ceil(network)}Mbps`;
    };

    return {
      cpu: formatCpu(totalCpu),
      memory: formatMemory(totalMemory),
      storage: formatStorage(totalStorage),
      network: formatNetwork(totalNetwork)
    };
  }
}