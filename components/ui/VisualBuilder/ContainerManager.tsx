'use client';

import { NodeData } from './CanvasNode';
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
    viewMode: 'nested' | 'connected' = 'nested'
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
      status: 'running',
      resources: {
        cpu: '1 CPU',
        memory: '512MB'
      },
      position,
      isCompact: false,
      onDelete: () => {},
      onToggleCompact: () => {}
    } as const;

    if (viewMode === 'connected') {
      return {
        ...baseContainer,
        connectedServices: containedNodes.map((node, index) => ({
          id: node.id,
          name: node.name,
          port: `${3000 + index}`,
          status: 'connected' as const
        })),
        ports: ['3000', '5000', '8080'],
        width: 300,
        height: 200
      };
    }

    // Nested view (default)
    return {
      ...baseContainer,
      containedNodes,
      ports: ['3000', '5000'],
      width: 400,
      height: 300
    };
  }

  /**
   * Create a new Kubernetes cluster
   */
  static createKubernetesCluster(
    id: string,
    position: { x: number; y: number },
    containedNodes: NodeData[] = [],
    viewMode: 'nested' | 'connected' = 'nested'
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
      status: 'running',
      resources: {
        cpu: '4 CPU',
        memory: '8GB'
      },
      position,
      isCompact: false,
      onDelete: () => {},
      onToggleCompact: () => {}
    } as const;

    if (viewMode === 'connected') {
      return {
        ...baseCluster,
        connectedServices: containedNodes.map((node, index) => ({
          id: node.id,
          name: node.name,
          port: `${8080 + index}`,
          status: 'connected' as const
        })),
        ports: ['80', '443', '8080', '9090'],
        width: 400,
        height: 250
      };
    }

    // Nested view (default)
    return {
      ...baseCluster,
      containedNodes,
      ports: ['80', '443', '8080'],
      width: 600,
      height: 400
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

    return false;
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

    return overlapPercentage >= 0.7; // At least 70% inside
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

    // Calculate new size based on content
    const minWidth = 400;
    const minHeight = 300;
    const contentPadding = 100; // Extra space for content
    
    let newWidth = minWidth;
    let newHeight = minHeight;

    if (validNodes.length > 0) {
      // Add height for each contained node
      newHeight = Math.max(minHeight, 200 + (validNodes.length * 80));
      
      // Adjust width if needed for Kubernetes clusters
      if (container.containerType === 'kubernetes') {
        newWidth = Math.max(600, minWidth + contentPadding);
        newHeight = Math.max(400, newHeight);
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

    return {
      ...container,
      containedNodes: validNodes,
      width: newWidth,
      height: newHeight,
      ports
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
}