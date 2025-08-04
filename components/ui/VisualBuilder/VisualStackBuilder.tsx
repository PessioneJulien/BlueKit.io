'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ComponentPalette } from './ComponentPalette';
import { ReactFlowCanvas } from './ReactFlowCanvas';
import { NodeData, NodePosition, SubTechnology } from './CanvasNode';
import { Connection } from './ConnectionLine';
import { ConnectionStyle } from './ConnectionStyleEditor';
import { NodeCustomStyle } from './NodeColorPicker';
import { ContainerViewManager, ContainerViewType } from './ContainerViewManager';
import { ContainerViewContext } from './ContainerNode';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useUserStore } from '@/lib/stores/userStore';
import { useStackStore } from '@/lib/stores/stackStore';
import { 
  Save, 
  Download, 
  Share2, 
  Info,
  X,
  Layers,
  Code,
  Lock,
  LogIn,
  Eye,
  EyeOff,
  Globe,
  Users,
  Monitor,
  Undo,
  Redo
} from 'lucide-react';
import { ExportModal } from './ExportModal';
import { TemplatesModal } from './TemplatesModal';
import { ConnectionToolbar } from './ConnectionToolbar';
import { NodeToolbar } from './NodeToolbar';
import { VisibilityModal } from './VisibilityModal';
import { StackTemplate } from '@/lib/data/stackTemplates';
import { SimplePresentationMode } from '@/components/ui/SimplePresentationMode';
import { useContainerLogic } from '@/lib/hooks/useContainerLogic';
import { loadDockerTestTemplate } from '@/lib/data/testTemplate';
import { CustomContainerModal, ContainerTemplate } from './CustomContainerModal';
import Link from 'next/link';

interface CanvasNode extends NodeData {
  position: NodePosition;
  isCompact?: boolean;
  width?: number;
  height?: number;
  documentation?: string;
}

interface VisualStackBuilderProps {
  initialStack?: {
    name: string;
    description: string;
    nodes: CanvasNode[];
    connections: Connection[];
  };
  onSave?: (stack: {
    name: string;
    description: string;
    nodes: CanvasNode[];
    connections: Connection[];
  }) => void;
  className?: string;
}

// Technologies principales avec leurs sous-technologies
const mainTechnologies: NodeData[] = [
  {
    id: 'react',
    name: 'React',
    category: 'frontend',
    description: 'A JavaScript library for building user interfaces',
    setupTimeHours: 2,
    difficulty: 'intermediate',
    pricing: 'free',
    isMainTechnology: true,
    canAcceptSubTech: ['styling', 'state-management', 'routing', 'testing', 'documentation'],
    compatibleWith: ['typescript', 'nextjs', 'nodejs'],
    incompatibleWith: ['angular', 'vue'],
    resources: {
      cpu: '0.5 cores',
      memory: '512MB',
      storage: '100MB',
      network: '10Mbps'
    },
    environmentVariables: {
      'NODE_ENV': 'development',
      'REACT_APP_API_URL': 'http://localhost:3001'
    }
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    category: 'frontend',
    description: 'The React Framework for Production',
    setupTimeHours: 3,
    difficulty: 'intermediate',
    pricing: 'free',
    isMainTechnology: true,
    canAcceptSubTech: ['styling', 'testing', 'documentation', 'deployment'],
    compatibleWith: ['react', 'typescript', 'vercel', 'supabase'],
    incompatibleWith: ['gatsby', 'create-react-app'],
    resources: {
      cpu: '1 core',
      memory: '1GB',
      storage: '200MB',
      network: '20Mbps'
    },
    environmentVariables: {
      'NODE_ENV': 'development',
      'NEXT_PUBLIC_API_URL': 'http://localhost:3001'
    }
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'backend',
    description: 'JavaScript runtime built on Chrome\'s V8 engine',
    setupTimeHours: 2,
    difficulty: 'intermediate',
    pricing: 'free',
    isMainTechnology: true,
    canAcceptSubTech: ['testing', 'linting', 'build-tool'],
    compatibleWith: ['express', 'typescript', 'mongodb', 'postgresql'],
    resources: {
      cpu: '1 core',
      memory: '512MB',
      storage: '150MB',
      network: '50Mbps'
    },
    environmentVariables: {
      'NODE_ENV': 'development',
      'PORT': '3000',
      'API_KEY': ''
    }
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    category: 'database',
    description: 'Powerful open source database',
    setupTimeHours: 3,
    difficulty: 'intermediate',
    pricing: 'free',
    isMainTechnology: true,
    canAcceptSubTech: ['testing'],
    compatibleWith: ['nodejs', 'supabase', 'prisma'],
    resources: {
      cpu: '2 cores',
      memory: '2GB',
      storage: '10GB',
      network: '100Mbps'
    },
    environmentVariables: {
      'POSTGRES_DB': 'myapp',
      'POSTGRES_USER': 'user',
      'POSTGRES_PASSWORD': 'password',
      'POSTGRES_HOST': 'localhost',
      'POSTGRES_PORT': '5432'
    }
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    category: 'database',
    description: 'Document-based NoSQL database',
    setupTimeHours: 2,
    difficulty: 'beginner',
    pricing: 'freemium',
    isMainTechnology: true,
    canAcceptSubTech: ['testing'],
    compatibleWith: ['nodejs', 'express'],
    incompatibleWith: ['postgresql'],
    resources: {
      cpu: '1 core',
      memory: '1GB',
      storage: '5GB',
      network: '50Mbps'
    },
    environmentVariables: {
      'MONGO_INITDB_DATABASE': 'myapp',
      'MONGO_INITDB_ROOT_USERNAME': 'admin',
      'MONGO_INITDB_ROOT_PASSWORD': 'password',
      'MONGODB_HOST': 'localhost',
      'MONGODB_PORT': '27017'
    }
  },
  {
    id: 'docker',
    name: 'Docker',
    category: 'devops',
    description: 'Container platform for packaging applications',
    setupTimeHours: 2,
    difficulty: 'intermediate',
    pricing: 'free',
    isMainTechnology: true,
    compatibleWith: ['nodejs', 'react', 'postgresql', 'mongodb'],
    resources: {
      cpu: '0.5 cores',
      memory: '256MB',
      storage: '1GB',
      network: '10Mbps'
    },
    environmentVariables: {
      'DOCKER_HOST': 'unix:///var/run/docker.sock',
      'COMPOSE_PROJECT_NAME': 'myapp'
    }
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    category: 'devops',
    description: 'Container orchestration platform',
    setupTimeHours: 5,
    difficulty: 'expert',
    pricing: 'free',
    isMainTechnology: true,
    compatibleWith: ['docker'],
    resources: {
      cpu: '2 cores',
      memory: '2GB',
      storage: '5GB',
      network: '100Mbps'
    },
    environmentVariables: {
      'KUBECONFIG': '/home/user/.kube/config',
      'KUBERNETES_NAMESPACE': 'default',
      'KUBECTL_VERSION': 'v1.28.0'
    }
  },
  {
    id: 'docker-container',
    name: 'Docker Container',
    category: 'devops',
    description: '🐳 Ready-to-use Docker container for hosting applications',
    setupTimeHours: 1,
    difficulty: 'beginner',
    pricing: 'free',
    isMainTechnology: true,
    isContainer: true,
    containerType: 'docker',
    compatibleWith: ['nodejs', 'react', 'postgresql', 'mongodb'],
    resources: {
      cpu: '1 core',
      memory: '512MB',
      storage: '2GB',
      network: '50Mbps'
    },
    environmentVariables: {
      'DOCKER_HOST': 'unix:///var/run/docker.sock',
      'COMPOSE_PROJECT_NAME': 'myapp'
    }
  },
  {
    id: 'kubernetes-cluster',
    name: 'Kubernetes Cluster',
    category: 'devops',
    description: '☸️ Ready-to-use Kubernetes cluster for orchestrating containers',
    setupTimeHours: 3,
    difficulty: 'intermediate',
    pricing: 'free',
    isMainTechnology: true,
    isContainer: true,
    containerType: 'kubernetes',
    compatibleWith: ['docker'],
    resources: {
      cpu: '4 cores',
      memory: '8GB',
      storage: '20GB',
      network: '1Gbps'
    },
    environmentVariables: {
      'KUBECONFIG': '/etc/kubernetes/admin.conf',
      'KUBE_NAMESPACE': 'default',
      'CLUSTER_NAME': 'production'
    }
  }
];

// Sous-technologies/outils disponibles
const subTechnologies: SubTechnology[] = [
  // Styling
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    type: 'styling',
    description: 'A utility-first CSS framework',
    setupTimeHours: 1,
    difficulty: 'beginner',
    pricing: 'free'
  },
  {
    id: 'material-ui',
    name: 'Material-UI',
    type: 'styling',
    description: 'React components implementing Material Design',
    setupTimeHours: 2,
    difficulty: 'beginner',
    pricing: 'free'
  },
  {
    id: 'styled-components',
    name: 'Styled Components',
    type: 'styling',
    description: 'Visual primitives for the component age',
    setupTimeHours: 1,
    difficulty: 'intermediate',
    pricing: 'free'
  },
  // Testing
  {
    id: 'jest',
    name: 'Jest',
    type: 'testing',
    description: 'JavaScript testing framework',
    setupTimeHours: 2,
    difficulty: 'intermediate',
    pricing: 'free'
  },
  {
    id: 'cypress',
    name: 'Cypress',
    type: 'testing',
    description: 'End-to-end testing framework',
    setupTimeHours: 3,
    difficulty: 'intermediate',
    pricing: 'freemium'
  },
  {
    id: 'playwright',
    name: 'Playwright',
    type: 'testing',
    description: 'Cross-browser automation',
    setupTimeHours: 2,
    difficulty: 'intermediate',
    pricing: 'free'
  },
  // Documentation
  {
    id: 'storybook',
    name: 'Storybook',
    type: 'documentation',
    description: 'Tool for building UI components in isolation',
    setupTimeHours: 2,
    difficulty: 'intermediate',
    pricing: 'free'
  },
  // State Management
  {
    id: 'redux',
    name: 'Redux',
    type: 'state-management',
    description: 'Predictable state container',
    setupTimeHours: 3,
    difficulty: 'intermediate',
    pricing: 'free'
  },
  {
    id: 'zustand',
    name: 'Zustand',
    type: 'state-management',
    description: 'Small, fast state management',
    setupTimeHours: 1,
    difficulty: 'beginner',
    pricing: 'free'
  },
  // Routing
  {
    id: 'react-router',
    name: 'React Router',
    type: 'routing',
    description: 'Declarative routing for React',
    setupTimeHours: 1,
    difficulty: 'beginner',
    pricing: 'free'
  }
];

// Map sub-technology types to display categories
const mapSubTechTypeToCategory = (subTechType: string): NodeData['category'] => {
  const mapping: Record<string, NodeData['category']> = {
    'styling': 'ui-ux',
    'testing': 'testing',
    'documentation': 'documentation',
    'state-management': 'state-management',
    'routing': 'routing',
    'build-tool': 'build-tools',
    'linting': 'linting',
    'deployment': 'devops'
  };
  return mapping[subTechType] || 'other';
};

// Combine all available components
const availableComponents: NodeData[] = [
  ...mainTechnologies,
  // Convert sub-technologies to NodeData format for palette display
  ...subTechnologies.map(subTech => ({
    id: subTech.id,
    name: subTech.name,
    category: mapSubTechTypeToCategory(subTech.type),
    description: subTech.description,
    setupTimeHours: subTech.setupTimeHours,
    difficulty: subTech.difficulty,
    pricing: subTech.pricing,
    isMainTechnology: false
  }))
];

export const VisualStackBuilder: React.FC<VisualStackBuilderProps> = ({
  initialStack,
  onSave,
  className
}) => {
  const { user, isLoading: userLoading } = useUserStore();
  const [stackName, setStackName] = useState(initialStack?.name || '');
  const [stackDescription, setStackDescription] = useState(initialStack?.description || '');
  const [nodes, setNodes] = useState<CanvasNode[]>(initialStack?.nodes || []);
  const [connections, setConnections] = useState<Connection[]>(initialStack?.connections || []);
  const [containerViewMode, setContainerViewMode] = useState<ContainerViewType>('nested');
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'components' | 'export'>('components');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [showPresentationMode, setShowPresentationMode] = useState(false);
  const [showCustomContainerModal, setShowCustomContainerModal] = useState(false);
  const [nodeToConvert, setNodeToConvert] = useState<NodeData | null>(null);

  // Container logic
  const { 
    convertToContainer, 
    processContainerRelationships,
    handleNodeDrop 
  } = useContainerLogic();

  // Undo/Redo state
  const historyRef = useRef<Array<{
    stackName: string;
    stackDescription: string;
    nodes: CanvasNode[];
    connections: Connection[];
  }>>([]);
  const historyIndexRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedState, setLastSavedState] = useState<string>('');
  const [showSavedNotification, setShowSavedNotification] = useState(false);

  // Get used component IDs
  const usedComponentIds = useMemo(() => nodes.map(node => node.id), [nodes]);

  // Save current state to history
  const saveToHistory = useCallback(() => {
    const currentState = {
      stackName,
      stackDescription,
      nodes,
      connections
    };
    
    // Remove any states after current index
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    
    // Add new state
    historyRef.current.push(currentState);
    
    // Limit history size to 50 states
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
    } else {
      historyIndexRef.current++;
    }
    
    // Update can undo/redo states
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(false);
  }, [stackName, stackDescription, nodes, connections]);

  // Undo function
  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      const previousState = historyRef.current[historyIndexRef.current];
      
      setStackName(previousState.stackName);
      setStackDescription(previousState.stackDescription);
      setNodes(previousState.nodes);
      setConnections(previousState.connections);
      
      setCanUndo(historyIndexRef.current > 0);
      setCanRedo(true);
    }
  }, []);

  // Redo function
  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      const nextState = historyRef.current[historyIndexRef.current];
      
      setStackName(nextState.stackName);
      setStackDescription(nextState.stackDescription);
      setNodes(nextState.nodes);
      setConnections(nextState.connections);
      
      setCanUndo(true);
      setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
    }
  }, []);

  // Track changes and save to history
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // Save initial state
      saveToHistory();
      // Set initial saved state
      const initialState = JSON.stringify({ stackName, stackDescription, nodes, connections });
      setLastSavedState(initialState);
      return;
    }
    
    // Debounce history saves
    const timeoutId = setTimeout(() => {
      saveToHistory();
      
      // Check if there are unsaved changes
      const currentState = JSON.stringify({ stackName, stackDescription, nodes, connections });
      setHasUnsavedChanges(currentState !== lastSavedState);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [stackName, stackDescription, nodes, connections, saveToHistory, lastSavedState]);

  // Manual save function
  const saveWork = useCallback(() => {
    const currentState = { stackName, stackDescription, nodes, connections };
    const stateString = JSON.stringify(currentState);
    
    // Save to localStorage
    try {
      localStorage.setItem('visual_stack_builder_manual_save', stateString);
      setLastSavedState(stateString);
      setHasUnsavedChanges(false);
      
      // Show saved notification
      setShowSavedNotification(true);
      setTimeout(() => setShowSavedNotification(false), 2000);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  }, [stackName, stackDescription, nodes, connections]);

  // Load saved work on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('visual_stack_builder_manual_save');
      if (savedData && !initialStack) {
        const parsed = JSON.parse(savedData);
        setStackName(parsed.stackName || '');
        setStackDescription(parsed.stackDescription || '');
        setNodes(parsed.nodes || []);
        setConnections(parsed.connections || []);
        setLastSavedState(savedData);
      }
    } catch (error) {
      console.error('Failed to load saved data:', error);
    }
  }, [initialStack]);

  // Keyboard shortcuts for undo/redo and save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
      } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        redo();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveWork();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, saveWork]);

  // Handle template selection
  const handleTemplateSelect = (template: StackTemplate) => {
    setStackName(template.name);
    setStackDescription(template.description);
    setNodes(template.nodes);
    setConnections(template.connections);
  };

  const handleLoadTestTemplate = () => {
    const testTemplate = loadDockerTestTemplate();
    setStackName(testTemplate.name);
    setStackDescription(testTemplate.description);
    setNodes(testTemplate.nodes);
    setConnections(testTemplate.connections);
  };

  // Handle documentation save
  const handleDocumentationSave = useCallback((nodeId: string, documentation: string) => {
    const updatedNodes = nodes.map(node => 
      node.id === nodeId ? { ...node, documentation } : node
    );
    setNodes(updatedNodes);
  }, [nodes]);

  // Handle connection style changes
  const handleConnectionStyleChange = useCallback((connectionId: string, style: ConnectionStyle) => {
    setConnections(prev => prev.map(conn => 
      conn.id === connectionId 
        ? { ...conn, style } 
        : conn
    ));
  }, []);

  // Handle connection selection
  const handleConnectionSelect = useCallback((connectionId: string | null) => {
    setSelectedConnectionId(connectionId);
    // Close node selection when connection is selected
    if (connectionId) setSelectedNodeId(null);
  }, []);

  // Handle node selection
  const handleNodeSelect = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    // Close connection selection when node is selected
    setSelectedConnectionId(null);
  }, []);

  // Handle visibility change confirmation
  const handleVisibilityChange = useCallback((newVisibility: boolean) => {
    setIsPublic(newVisibility);
    setShowVisibilityModal(false);
  }, []);

  // Handle node style changes
  const handleNodeStyleChange = useCallback((nodeId: string, customStyle: NodeCustomStyle) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, customStyle } 
        : node
    ));
  }, []);

  // Add sub-technology to main component
  const handleAddSubTechnology = useCallback((subTechId: string, mainTechId: string) => {
    const subTech = subTechnologies.find(st => st.id === subTechId);
    const mainTech = nodes.find(n => n.id === mainTechId);
    
    if (!subTech || !mainTech || !mainTech.canAcceptSubTech?.includes(subTech.type)) {
      return;
    }

    // Check if sub-tech is already added
    if (mainTech.subTechnologies?.some(st => st.id === subTechId)) {
      return;
    }

    const updatedNodes = nodes.map(node => {
      if (node.id === mainTechId) {
        const newSubTechnologies = [...(node.subTechnologies || []), subTech];
        const isCompact = node.isCompact ?? true;
        
        // Adjust height to accommodate new sub-technology
        const newHeight = isCompact ? 
          (newSubTechnologies.length > 0 ? Math.min(120 + (newSubTechnologies.length * 10), 200) : 80) : 
          (newSubTechnologies.length > 0 ? Math.min(180 + (newSubTechnologies.length * 15), 280) : 140);
        
        return {
          ...node,
          subTechnologies: newSubTechnologies,
          height: newHeight
        };
      }
      return node;
    });

    setNodes(updatedNodes);
  }, [nodes]);

  // Remove component from container
  const handleRemoveFromContainer = useCallback((containerId: string, nodeId: string) => {
    console.log('🗑️ Remove node', nodeId, 'from container', containerId);
    
    setNodes(prevNodes => {
      return prevNodes.map(node => {
        if (node.id === containerId && 'isContainer' in node && node.isContainer) {
          const container = node as CanvasNode & { isContainer: true; containedNodes?: NodeData[] };
          const updatedContainedNodes = (container.containedNodes || []).filter(n => n.id !== nodeId);
          
          // Find the removed node to restore it to canvas
          const removedNode = container.containedNodes?.find(n => n.id === nodeId);
          
          console.log('🔄 Updated container contained nodes:', updatedContainedNodes.length);
          
          return {
            ...container,
            containedNodes: updatedContainedNodes
          };
        }
        return node;
      });
    });
  }, []);

  // Handle dropping component from palette
  const handleDropComponent = useCallback((component: NodeData, position: { x: number; y: number }) => {
    console.log('🚀 handleDropComponent called with:', component.name, 'at position:', position);
    
    if (usedComponentIds.includes(component.id)) {
      console.log('❌ Component already used:', component.id);
      return;
    }

    // If it's a sub-technology, try to add it to a compatible main technology
    if (!component.isMainTechnology) {
      const subTech = subTechnologies.find(st => st.id === component.id);
      if (subTech) {
        const compatibleMainTech = nodes.find(node => 
          node.isMainTechnology && 
          node.canAcceptSubTech?.includes(subTech.type) &&
          !node.subTechnologies?.some(st => st.id === subTech.id)
        );
        
        if (compatibleMainTech) {
          handleAddSubTechnology(component.id, compatibleMainTech.id);
          return;
        }
      }
      // If no compatible main tech found, don't add it as standalone
      return;
    }

    let newNode: CanvasNode = {
      ...component,
      position,
      isCompact: true,
      width: 200,
      height: 80
    };

    // Convert Docker/Kubernetes to container nodes (but not if they're already containers)
    if ((component.id === 'docker' || component.id === 'kubernetes') && !component.isContainer) {
      newNode = convertToContainer(newNode);
    }
    
    // Handle pre-configured container components
    if (component.isContainer) {
      newNode = {
        ...newNode,
        width: component.containerType === 'docker' ? 400 : 500,
        height: component.containerType === 'docker' ? 300 : 350,
        isCompact: false,
        containedNodes: [],
        connectedServices: [],
        ports: component.containerType === 'docker' ? ['3000', '3001'] : ['80', '443', '8080'],
        status: 'running'
      };
    }

    // Check if node is being dropped into a container
    const { updatedNodes, wasContained } = handleNodeDrop(newNode, nodes);
    
    if (wasContained) {
      setNodes(updatedNodes);
    } else {
      setNodes(prev => [...prev, newNode]);
    }
  }, [usedComponentIds, handleAddSubTechnology, nodes, convertToContainer, handleNodeDrop]);

  // Add component to canvas
  const handleAddComponent = useCallback((component: NodeData) => {
    if (usedComponentIds.includes(component.id)) return;

    // If it's a sub-technology, try to add it to a compatible main technology
    if (!component.isMainTechnology) {
      const subTech = subTechnologies.find(st => st.id === component.id);
      if (subTech) {
        const compatibleMainTech = nodes.find(node => 
          node.isMainTechnology && 
          node.canAcceptSubTech?.includes(subTech.type) &&
          !node.subTechnologies?.some(st => st.id === subTech.id)
        );
        
        if (compatibleMainTech) {
          handleAddSubTechnology(component.id, compatibleMainTech.id);
          return;
        }
      }
      // If no compatible main tech found, don't add it as standalone
      return;
    }

    // Find a good position for the new node
    const canvasWidth = 2000;
    const canvasHeight = 1500;
    const nodeWidth = 200;
    const nodeHeight = 80;
    const padding = 20;

    let position: NodePosition = { x: padding, y: padding };

    // Try to find a non-overlapping position
    for (let y = padding; y < canvasHeight - nodeHeight; y += nodeHeight + padding) {
      for (let x = padding; x < canvasWidth - nodeWidth; x += nodeWidth + padding) {
        const testPosition = { x, y };
        const overlaps = nodes.some(node => 
          Math.abs(node.position.x - testPosition.x) < nodeWidth + padding &&
          Math.abs(node.position.y - testPosition.y) < nodeHeight + padding
        );
        
        if (!overlaps) {
          position = testPosition;
          break;
        }
      }
      if (position.x !== padding || position.y !== padding) break;
    }

    let newNode: CanvasNode = {
      ...component,
      position,
      isCompact: true, // Start in compact mode
      width: 200,
      height: 80
    };

    // Convert Docker/Kubernetes to container nodes (but not if they're already containers)
    if ((component.id === 'docker' || component.id === 'kubernetes') && !component.isContainer) {
      newNode = convertToContainer(newNode);
    }
    
    // Handle pre-configured container components
    if (component.isContainer) {
      newNode = {
        ...newNode,
        width: component.containerType === 'docker' ? 400 : 500,
        height: component.containerType === 'docker' ? 300 : 350,
        isCompact: false,
        containedNodes: [],
        connectedServices: [],
        ports: component.containerType === 'docker' ? ['3000', '3001'] : ['80', '443', '8080'],
        status: 'running'
      };
    }

    setNodes(prev => [...prev, newNode]);
  }, [handleAddSubTechnology, nodes, usedComponentIds, convertToContainer]);

  // Convert node to container
  const handleConvertToContainer = useCallback((nodeId: string, containerType: 'docker' | 'kubernetes' | 'custom') => {
    const nodeToConvert = nodes.find(n => n.id === nodeId);
    if (!nodeToConvert) return;

    if (containerType === 'custom') {
      setNodeToConvert(nodeToConvert);
      setShowCustomContainerModal(true);
    } else {
      // Direct conversion for Docker/Kubernetes
      setNodes(prev => prev.map(node => {
        if (node.id === nodeId) {
          return {
            ...node,
            isContainer: true,
            containerType,
            containedNodes: [],
            connectedServices: [],
            ports: containerType === 'docker' ? ['3000', '3001'] : ['80', '443', '8080'],
            status: 'running' as const,
            width: containerType === 'docker' ? 400 : 500,
            height: containerType === 'docker' ? 300 : 350,
            isCompact: false
          };
        }
        return node;
      }));
    }
  }, [nodes]);

  // Handle custom container creation
  const handleCreateCustomContainer = useCallback((template: ContainerTemplate, customName?: string) => {
    if (nodeToConvert) {
      // Convert existing node
      setNodes(prev => prev.map(node => {
        if (node.id === nodeToConvert.id) {
          return {
            ...node,
            name: customName || `${node.name} Container`,
            isContainer: true,
            containerType: template.id as 'docker' | 'kubernetes',
            containedNodes: [],
            connectedServices: [],
            ports: template.defaultPorts || [],
            status: 'running' as const,
            width: 400,
            height: 300,
            isCompact: false,
            resources: template.defaultResources,
            environmentVariables: {
              ...node.environmentVariables,
              ...template.environmentVariables
            }
          };
        }
        return node;
      }));
    } else {
      // Create new container
      const newContainer: CanvasNode = {
        id: `container-${Date.now()}`,
        name: customName || template.name,
        category: 'devops',
        description: template.description,
        setupTimeHours: 2,
        difficulty: 'intermediate',
        pricing: 'free',
        isMainTechnology: true,
        isContainer: true,
        containerType: template.id as 'docker' | 'kubernetes',
        containedNodes: [],
        connectedServices: [],
        ports: template.defaultPorts || [],
        status: 'running',
        resources: template.defaultResources,
        environmentVariables: template.environmentVariables,
        position: { x: 100, y: 100 },
        width: 400,
        height: 300,
        isCompact: false
      };
      
      setNodes(prev => [...prev, newContainer]);
    }
    
    setNodeToConvert(null);
  }, [nodeToConvert]);

  // Calculate stack statistics
  const stackStats = useMemo(() => {
    const totalSetupTime = nodes.reduce((sum, node) => sum + node.setupTimeHours, 0);
    const difficulties = nodes.map(node => node.difficulty);
    const expertCount = difficulties.filter(d => d === 'expert').length;
    const beginnerCount = difficulties.filter(d => d === 'beginner').length;
    
    let averageDifficulty: 'beginner' | 'intermediate' | 'expert' = 'intermediate';
    if (expertCount > nodes.length / 2) {
      averageDifficulty = 'expert';
    } else if (beginnerCount > nodes.length / 2) {
      averageDifficulty = 'beginner';
    }

    const categories = Array.from(new Set(nodes.map(node => node.category)));
    const hasIncompatible = connections.some(conn => conn.type === 'incompatible');

    return {
      totalSetupTime,
      averageDifficulty,
      categories,
      hasIncompatible,
      nodeCount: nodes.length,
      connectionCount: connections.length
    };
  }, [nodes, connections]);

  const { saveStack } = useStackStore();
  const [savedStackId, setSavedStackId] = useState<string | null>(null);

  // Handle save
  const handleSave = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!stackName.trim()) {
      alert('Please enter a stack name before saving.');
      return;
    }

    if (nodes.length === 0) {
      alert('Please add at least one component to your stack before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const stackData = {
        name: stackName,
        description: stackDescription,
        nodes,
        connections,
        is_public: isPublic
      };

      const stackId = await saveStack(stackData);
      if (stackId) {
        setSavedStackId(stackId);
        alert('Stack saved successfully!');
      } else {
        throw new Error('Failed to save stack');
      }
    } catch (error: unknown) {
      console.error('Failed to save stack:', error);
      const errorMessage = (error as Error)?.message || 'Unknown error occurred';
      alert(`Failed to save stack: ${errorMessage}\n\nPlease check:\n1. You are logged in\n2. Database migration has been run\n3. RLS policies are configured correctly`);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle present (requires auth for saving stack first)
  const handlePresent = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (nodes.length === 0) {
      alert('Please add at least one component before presenting.');
      return;
    }

    let stackId = savedStackId;
    
    // Save stack first if it's new or has unsaved changes
    if (!stackId || stackName) {
      if (!stackName?.trim()) {
        alert('Please enter a stack name before presenting.');
        return;
      }
      
      try {
        setIsSaving(true);
        const stackData = {
          name: stackName,
          description: stackDescription,
          nodes,
          connections,
          is_public: isPublic
        };
        
        stackId = await saveStack(stackData);
        if (stackId) {
          setSavedStackId(stackId);
        } else {
          throw new Error('Failed to save stack');
        }
      } catch (error: unknown) {
        console.error('Failed to save before presenting:', error);
        const errorMessage = (error as Error)?.message || 'Unknown error occurred';
        alert(`Failed to save stack: ${errorMessage}\n\nPlease check:\n1. You are logged in\n2. Database migration has been run\n3. RLS policies are configured correctly`);
        return;
      } finally {
        setIsSaving(false);
      }
    }

    if (stackId) {
      const presentationUrl = `/presentation/${stackId}`;
      window.open(presentationUrl, '_blank');
    }
  };

  return (
    <div className={cn('flex h-screen bg-slate-950', className)}>
      {/* Component Palette Sidebar */}
      {showSidebar && (
        <div className="w-80 flex flex-col border-r border-slate-700">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Button
                variant={selectedTab === 'components' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTab('components')}
              >
                <Layers className="h-4 w-4 mr-1" />
                Components
              </Button>
              <Button
                variant={selectedTab === 'export' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedTab('export')}
              >
                <Code className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Sidebar Content */}
          {selectedTab === 'components' && (
            <div className="flex-1 flex flex-col gap-4 p-4">
              {/* Container View Manager */}
              <ContainerViewManager
                currentView={containerViewMode}
                onViewChange={setContainerViewMode}
              />
              
              {/* Component Palette */}
              <ComponentPalette
                availableComponents={availableComponents}
                subTechnologies={subTechnologies}
                onAddComponent={handleAddComponent}
                onOpenCustomContainerModal={() => setShowCustomContainerModal(true)}
                usedComponentIds={usedComponentIds}
                className="flex-1"
              />
            </div>
          )}

          {selectedTab === 'export' && (
            <div className="flex-1 p-4 space-y-4">
              {/* Stack Info */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Stack Name
                  </label>
                  <Input
                    value={stackName}
                    onChange={(e) => setStackName(e.target.value)}
                    placeholder="My Awesome Stack"
                    className="text-sm"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Description
                  </label>
                  <textarea
                    value={stackDescription}
                    onChange={(e) => setStackDescription(e.target.value)}
                    placeholder="Describe your technology stack..."
                    className="w-full h-20 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 resize-none text-sm"
                  />
                </div>

                {/* Visibility Settings */}
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Visibility
                  </label>
                  <div className="flex gap-2">
                    <Button
                      variant={isPublic ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        if (!isPublic) {
                          setShowVisibilityModal(true);
                        }
                      }}
                      className="flex-1 text-xs h-8"
                    >
                      <Globe className="w-3 h-3 mr-1" />
                      Public
                    </Button>
                    <Button
                      variant={!isPublic ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => {
                        if (isPublic) {
                          setShowVisibilityModal(true);
                        }
                      }}
                      className="flex-1 text-xs h-8"
                    >
                      <Lock className="w-3 h-3 mr-1" />
                      Private
                    </Button>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {isPublic 
                      ? "Anyone can view and discover your stack"
                      : "Only you can access this stack"
                    }
                  </p>
                </div>
              </div>

              {/* Statistics */}
              <Card variant="glass">
                <CardHeader>
                  <CardTitle className="text-sm">Stack Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Components</span>
                    <span className="text-slate-200">{stackStats.nodeCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Connections</span>
                    <span className="text-slate-200">{stackStats.connectionCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Setup Time</span>
                    <span className="text-slate-200">{stackStats.totalSetupTime}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Difficulty</span>
                    <Badge 
                      variant={
                        stackStats.averageDifficulty === 'beginner' ? 'success' :
                        stackStats.averageDifficulty === 'intermediate' ? 'warning' : 'danger'
                      }
                      size="sm"
                    >
                      {stackStats.averageDifficulty}
                    </Badge>
                  </div>
                  {stackStats.hasIncompatible && (
                    <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded mt-2">
                      <Info className="h-4 w-4 text-red-400" />
                      <span className="text-xs text-red-300">
                        Incompatible components detected
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-2">
                {!user ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-amber-400 text-sm mb-2">
                        <Lock className="w-4 h-4" />
                        Login Required
                      </div>
                      <p className="text-xs text-slate-400 mb-3">
                        You need to be logged in to save and share your stacks.
                      </p>
                      <Link href="/auth/login">
                        <Button variant="primary" size="sm" className="w-full">
                          <LogIn className="w-4 h-4 mr-2" />
                          Login to Save
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button 
                      variant="primary" 
                      className="w-full"
                      onClick={handleSave}
                      disabled={!stackName || nodes.length === 0 || isSaving}
                      isLoading={isSaving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Saving...' : `Save ${isPublic ? 'Public' : 'Private'}`}
                    </Button>
                    
                    {/* Quick Save Options */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setIsPublic(true);
                          setTimeout(handleSave, 100);
                        }}
                        disabled={!stackName || nodes.length === 0 || isSaving}
                        className="text-xs"
                      >
                        <Globe className="w-3 h-3 mr-1" />
                        Public
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setIsPublic(false);
                          setTimeout(handleSave, 100);
                        }}
                        disabled={!stackName || nodes.length === 0 || isSaving}
                        className="text-xs"
                      >
                        <Lock className="w-3 h-3 mr-1" />
                        Private
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setShowExportModal(true)}
                    disabled={nodes.length === 0}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <Button variant="secondary" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50">
          <div className="flex items-center gap-4">
            {!showSidebar && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(true)}
              >
                <Layers className="h-4 w-4 mr-2" />
                Show Sidebar
              </Button>
            )}
            
            <div className="text-slate-300">
              <h1 className="font-semibold">
                {stackName || 'Untitled Stack'}
              </h1>
              <div className="flex items-center gap-2">
                <p className="text-sm text-slate-500">
                  Visual Stack Builder
                </p>
                {user && (
                  <Badge variant="success" size="sm" className="text-xs">
                    Logged in as {user.name}
                  </Badge>
                )}
                {!user && (
                  <Badge variant="warning" size="sm" className="text-xs">
                    Not logged in
                  </Badge>
                )}
                {user && (
                  <Badge 
                    variant={isPublic ? "default" : "secondary"} 
                    size="sm" 
                    className="text-xs"
                  >
                    {isPublic ? (
                      <>
                        <Globe className="w-3 h-3 mr-1" />
                        Public
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 mr-1" />
                        Private
                      </>
                    )}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Test Template Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLoadTestTemplate}
              className="text-xs"
            >
              🧪 Test Template
            </Button>
            
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
                className="p-2"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={!canRedo}
                title="Redo (Ctrl+Shift+Z)"
                className="p-2"
              >
                <Redo className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-slate-700 mx-1" />
              <Button
                variant={hasUnsavedChanges ? "warning" : "ghost"}
                size="sm"
                onClick={saveWork}
                title="Save (Ctrl+S)"
                className="p-2"
              >
                <Save className="h-4 w-4" />
              </Button>
              {hasUnsavedChanges && (
                <span className="text-xs text-orange-400 ml-1">Unsaved</span>
              )}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowTemplatesModal(true)}
            >
              <Layers className="h-4 w-4 mr-1" />
              Templates
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowPresentationMode(true)}
              disabled={nodes.length === 0}
              title="View in presentation mode"
            >
              <Monitor className="h-4 w-4 mr-1" />
              Present
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={!user || !stackName?.trim() || nodes.length === 0}
              className={cn(
                "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
                !user && "from-gray-600 to-gray-700 hover:from-gray-600 hover:to-gray-700 cursor-not-allowed"
              )}
              title={!user ? "Login required to save stacks" : "Save stack to database"}
            >
              {!user ? (
                <>
                  <Lock className="h-4 w-4 mr-1" />
                  Save to Cloud
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-1" />
                  Save to Cloud
                </>
              )}
            </Button>
            
          </div>
        </div>

        {/* Connection Toolbar */}
        {selectedConnectionId && (
          <ConnectionToolbar
            connectionId={selectedConnectionId}
            currentStyle={connections.find(c => c.id === selectedConnectionId)?.style}
            onStyleChange={handleConnectionStyleChange}
            onClose={() => setSelectedConnectionId(null)}
          />
        )}

        {/* Node Toolbar */}
        {selectedNodeId && (
          <NodeToolbar
            nodeId={selectedNodeId}
            nodeName={nodes.find(n => n.id === selectedNodeId)?.name || 'Unknown'}
            currentStyle={nodes.find(n => n.id === selectedNodeId)?.customStyle}
            onStyleChange={handleNodeStyleChange}
            onClose={() => setSelectedNodeId(null)}
          />
        )}

        {/* Canvas */}
        <ContainerViewContext.Provider value={containerViewMode}>
          <ReactFlowCanvas
            nodes={nodes}
            connections={connections}
          onNodesChange={setNodes}
          onConnectionsChange={(newConnections) => {
            const convertedConnections: Connection[] = newConnections.map(conn => ({
              ...conn,
              sourcePosition: { x: 0, y: 0 },
              targetPosition: { x: 0, y: 0 },
              type: conn.type as 'compatible' | 'incompatible' | 'neutral'
            }));
            setConnections(convertedConnections);
          }}
          onConnectionStyleChange={handleConnectionStyleChange}
          onConnectionSelect={handleConnectionSelect}
          selectedConnectionId={selectedConnectionId}
          onNodeStyleChange={handleNodeStyleChange}
          onNodeSelect={handleNodeSelect}
          onDocumentationSave={handleDocumentationSave}
          onAddSubTechnology={handleAddSubTechnology}
          onDropComponent={handleDropComponent}
          onRemoveFromContainer={handleRemoveFromContainer}
          onConvertToContainer={handleConvertToContainer}
          availableSubTechnologies={subTechnologies}
          className="flex-1"
        />
        </ContainerViewContext.Provider>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        stackName={stackName}
        stackDescription={stackDescription}
        nodes={nodes}
        connections={connections}
      />

      {/* Templates Modal */}
      <TemplatesModal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        onSelectTemplate={handleTemplateSelect}
      />

      {/* Visibility Modal */}
      <VisibilityModal
        isOpen={showVisibilityModal}
        onClose={() => setShowVisibilityModal(false)}
        currentVisibility={isPublic}
        onConfirm={handleVisibilityChange}
        stackName={stackName || 'Untitled Stack'}
      />

      {/* Custom Container Modal */}
      <CustomContainerModal
        isOpen={showCustomContainerModal}
        onClose={() => {
          setShowCustomContainerModal(false);
          setNodeToConvert(null);
        }}
        onCreateContainer={handleCreateCustomContainer}
        sourceNode={nodeToConvert || undefined}
      />

      {/* Presentation Mode */}
      <SimplePresentationMode
        isOpen={showPresentationMode}
        onClose={() => setShowPresentationMode(false)}
        stackData={{
          name: stackName || 'Untitled Stack',
          description: stackDescription || 'No description provided',
          nodes: nodes,
          connections: connections
        }}
      />

      {/* Save Notification */}
      {showSavedNotification && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <Save className="h-4 w-4" />
          <span>Saved successfully!</span>
        </div>
      )}
    </div>
  );
};