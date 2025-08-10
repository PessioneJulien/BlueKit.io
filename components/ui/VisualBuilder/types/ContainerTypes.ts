import { NodeData } from '../CanvasNode';

// Extension du NodeData pour les containers
export interface ContainerNodeData extends NodeData {
  isContainer: true;
  containerType: 'docker' | 'kubernetes';
  containedNodes: NodeData[];
  ports?: string[];
  volumes?: string[];
  networks?: string[];
  status?: 'running' | 'stopped' | 'building' | 'error';
  replicas?: number;
}

// Interface pour les ressources calculées automatiquement
export interface AutoCalculatedResources {
  cpu: string;
  memory: string;
  cpuUnits: number;
  memoryMB: number;
}

// Interface pour les limites manuelles
export interface ManualResourceLimits {
  cpu: string;
  memory: string;
}

// Mode de gestion des ressources
export type ResourceMode = 'auto' | 'manual';

// Interface pour la configuration des ressources
export interface ResourceConfig {
  resourceMode: ResourceMode;
  manualResourceLimits?: ManualResourceLimits;
}