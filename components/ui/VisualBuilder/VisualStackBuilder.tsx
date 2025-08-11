'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ComponentPalette } from './ComponentPalette';
import { ReactFlowCanvas } from './ReactFlowCanvas';
import { NodeData, NodePosition, SubTechnology } from './CanvasNode';
import { Connection } from './ConnectionLine';
import { ConnectionStyle } from './ConnectionStyleEditor';
import { NodeCustomStyle } from './NodeColorPicker';
import { ContainerViewType } from './ContainerViewManager';
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
  Globe,
  Monitor,
  Undo,
  Redo
} from 'lucide-react';
import { ExportModal } from './ExportModal';
import { TemplatesModal } from './TemplatesModal';
import { ConnectionToolbar } from './ConnectionToolbar';
import { NodeToolbar } from './NodeToolbar';
import { ContainerConfigBar } from './ContainerConfigBar';
import { ResourceConfigModal } from './ResourceConfigModal';
import { VisibilityModal } from './VisibilityModal';
import { StackTemplate } from '@/lib/data/stackTemplates';
import { SimplePresentationMode } from '@/components/ui/SimplePresentationMode';
import { useContainerLogic } from '@/lib/hooks/useContainerLogic';
import { CustomContainerModal, ContainerTemplate } from './CustomContainerModal';
import { ShareModal } from './ShareModal';
import { useStackLimits } from '@/lib/hooks/useStackLimits';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { useSearchParams } from 'next/navigation';
import { componentsApi, type Component as CommunityComponent } from '@/lib/api/components';

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
  // Bases de données additionnelles
  {
    id: 'redis',
    name: 'Redis',
    category: 'database',
    description: 'In-memory data structure store, cache and message broker',
    setupTimeHours: 1,
    difficulty: 'beginner',
    pricing: 'free',
    isMainTechnology: true,
    compatibleWith: ['nodejs', 'react', 'postgresql'],
    resources: {
      cpu: '0.5 cores',
      memory: '256MB',
      storage: '1GB',
      network: '20Mbps'
    },
    environmentVariables: {
      'REDIS_HOST': 'localhost',
      'REDIS_PORT': '6379',
      'REDIS_PASSWORD': 'password'
    }
  },
  {
    id: 'supabase',
    name: 'Supabase',
    category: 'database',
    description: 'Open source Firebase alternative with PostgreSQL',
    setupTimeHours: 2,
    difficulty: 'beginner',
    pricing: 'freemium',
    isMainTechnology: true,
    compatibleWith: ['react', 'nextjs', 'nodejs'],
    resources: {
      cpu: '1 core',
      memory: '1GB',
      storage: '500MB',
      network: '50Mbps'
    },
    environmentVariables: {
      'SUPABASE_URL': 'https://your-project.supabase.co',
      'SUPABASE_ANON_KEY': 'your-anon-key',
      'SUPABASE_SERVICE_ROLE_KEY': 'your-service-role-key'
    }
  },
  {
    id: 'firebase',
    name: 'Firebase',
    category: 'database',
    description: 'Google\'s mobile and web app development platform',
    setupTimeHours: 2,
    difficulty: 'beginner',
    pricing: 'freemium',
    isMainTechnology: true,
    compatibleWith: ['react', 'nodejs'],
    resources: {
      cpu: '0.5 cores',
      memory: '512MB',
      storage: '1GB',
      network: '30Mbps'
    },
    environmentVariables: {
      'FIREBASE_API_KEY': 'your-api-key',
      'FIREBASE_PROJECT_ID': 'your-project-id',
      'FIREBASE_AUTH_DOMAIN': 'your-project.firebaseapp.com'
    }
  },
  // Outils d'authentification
  {
    id: 'auth0',
    name: 'Auth0',
    category: 'backend',
    description: 'Identity platform for secure authentication',
    setupTimeHours: 3,
    difficulty: 'intermediate',
    pricing: 'freemium',
    isMainTechnology: true,
    compatibleWith: ['react', 'nodejs', 'nextjs'],
    resources: {
      cpu: '0.2 cores',
      memory: '256MB',
      storage: '100MB',
      network: '10Mbps'
    },
    environmentVariables: {
      'AUTH0_DOMAIN': 'your-domain.auth0.com',
      'AUTH0_CLIENT_ID': 'your-client-id',
      'AUTH0_CLIENT_SECRET': 'your-client-secret'
    }
  },
  {
    id: 'clerk',
    name: 'Clerk',
    category: 'backend',
    description: 'Complete user authentication and management',
    setupTimeHours: 2,
    difficulty: 'beginner',
    pricing: 'freemium',
    isMainTechnology: true,
    compatibleWith: ['react', 'nextjs'],
    resources: {
      cpu: '0.2 cores',
      memory: '256MB',
      storage: '100MB',
      network: '10Mbps'
    },
    environmentVariables: {
      'CLERK_PUBLISHABLE_KEY': 'pk_test_your-key',
      'CLERK_SECRET_KEY': 'sk_test_your-key'
    }
  },
  // Outils de paiement
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'backend',
    description: 'Payment processing platform',
    setupTimeHours: 4,
    difficulty: 'intermediate',
    pricing: 'freemium',
    isMainTechnology: true,
    compatibleWith: ['nodejs', 'react', 'nextjs'],
    resources: {
      cpu: '0.3 cores',
      memory: '256MB',
      storage: '100MB',
      network: '15Mbps'
    },
    environmentVariables: {
      'STRIPE_PUBLISHABLE_KEY': 'pk_test_your-key',
      'STRIPE_SECRET_KEY': 'sk_test_your-key',
      'STRIPE_WEBHOOK_SECRET': 'whsec_your-webhook-secret'
    }
  },
  // Framework frontend additionnels
  {
    id: 'vue',
    name: 'Vue.js',
    category: 'frontend',
    description: 'Progressive JavaScript framework',
    setupTimeHours: 3,
    difficulty: 'intermediate',
    pricing: 'free',
    isMainTechnology: true,
    canAcceptSubTech: ['styling', 'state-management', 'routing', 'testing'],
    compatibleWith: ['nodejs'],
    incompatibleWith: ['react', 'angular'],
    resources: {
      cpu: '0.5 cores',
      memory: '512MB',
      storage: '200MB',
      network: '15Mbps'
    },
    environmentVariables: {
      'NODE_ENV': 'development',
      'VUE_APP_API_URL': 'http://localhost:3001'
    }
  },
  {
    id: 'angular',
    name: 'Angular',
    category: 'frontend',
    description: 'Platform for building mobile and desktop web applications',
    setupTimeHours: 4,
    difficulty: 'intermediate',
    pricing: 'free',
    isMainTechnology: true,
    canAcceptSubTech: ['styling', 'testing', 'documentation'],
    compatibleWith: ['nodejs', 'typescript'],
    incompatibleWith: ['react', 'vue'],
    resources: {
      cpu: '1 core',
      memory: '1GB',
      storage: '300MB',
      network: '20Mbps'
    },
    environmentVariables: {
      'NODE_ENV': 'development',
      'NG_APP_API_URL': 'http://localhost:3001'
    }
  },
  // Outils DevOps additionnels
  {
    id: 'vercel',
    name: 'Vercel',
    category: 'devops',
    description: 'Platform for frontend deployment and hosting',
    setupTimeHours: 1,
    difficulty: 'beginner',
    pricing: 'freemium',
    isMainTechnology: true,
    compatibleWith: ['nextjs', 'react', 'vue'],
    resources: {
      cpu: '0.1 cores',
      memory: '128MB',
      storage: '100GB',
      network: '100Mbps'
    },
    environmentVariables: {
      'VERCEL_TOKEN': 'your-token',
      'VERCEL_PROJECT_ID': 'your-project-id'
    }
  },
  {
    id: 'netlify',
    name: 'Netlify',
    category: 'devops',
    description: 'Platform for web development and deployment',
    setupTimeHours: 1,
    difficulty: 'beginner',
    pricing: 'freemium',
    isMainTechnology: true,
    compatibleWith: ['react', 'vue', 'angular'],
    resources: {
      cpu: '0.1 cores',
      memory: '128MB',
      storage: '100GB',
      network: '100Mbps'
    },
    environmentVariables: {
      'NETLIFY_AUTH_TOKEN': 'your-token',
      'NETLIFY_SITE_ID': 'your-site-id'
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
  const searchParams = useSearchParams();
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false);
  
  // Modal state for upgrade prompts
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    reason: string;
    currentCount?: number;
    limit?: number;
  }>({
    isOpen: false,
    reason: '',
  });

  const handleShowUpgradeModal = useCallback((reason: string, currentCount?: number, limit?: number) => {
    setUpgradeModal({
      isOpen: true,
      reason,
      currentCount,
      limit,
    });
  }, []);

  const handleCloseUpgradeModal = useCallback(() => {
    setUpgradeModal({
      isOpen: false,
      reason: '',
    });
  }, []);

  const { checkComponentLimit, checkFeatureAccess, checkExportLimit, limits, subscription } = useStackLimits(handleShowUpgradeModal);
  const [stackName, setStackName] = useState(initialStack?.name || '');
  const [stackDescription, setStackDescription] = useState(initialStack?.description || '');
  const [nodes, setNodes] = useState<CanvasNode[]>(initialStack?.nodes || []);
  const [connections, setConnections] = useState<Connection[]>(initialStack?.connections || []);
  const containerViewMode: ContainerViewType = 'nested';
  const [showSidebar, setShowSidebar] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  const [showPresentationMode, setShowPresentationMode] = useState(false);
  const [showCustomContainerModal, setShowCustomContainerModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showResourceConfigModal, setShowResourceConfigModal] = useState(false);
  const [resourceConfigNodeId, setResourceConfigNodeId] = useState<string | null>(null);
  const [nodeToConvert, setNodeToConvert] = useState<NodeData | null>(null);
  const [showQuickSearch, setShowQuickSearch] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [communityComponents, setCommunityComponents] = useState<CommunityComponent[]>([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);

  // Check for upgrade success
  useEffect(() => {
    if (searchParams?.get('upgraded') === 'true') {
      setShowUpgradeSuccess(true);
      // Nettoyer l'URL
      window.history.replaceState({}, '', '/builder');
      // Masquer le message après 5 secondes
      setTimeout(() => setShowUpgradeSuccess(false), 5000);
    }
  }, [searchParams]);

  // Load community components for quick search
  const loadCommunityComponents = useCallback(async () => {
    try {
      setLoadingCommunity(true);
      const components = await componentsApi.getComponents();
      setCommunityComponents(components);
    } catch (error) {
      console.error('Failed to load community components:', error);
    } finally {
      setLoadingCommunity(false);
    }
  }, []);

  // Load community components on mount
  useEffect(() => {
    loadCommunityComponents();
  }, [loadCommunityComponents]);

  // Container logic
  const { 
    convertToContainer, 
    handleNodeDrop,
    updateContainerNodes
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

  // Get used component IDs - DISABLED to allow multiple instances
  // Allow unlimited instances of the same component
  const usedComponentIds = useMemo(() => {
    // Return empty array to allow multiple instances of same component
    return [];
    
    // OLD LOGIC (commented out) - was preventing multiple instances
    // return nodes.map(node => {
    //   // If ID contains timestamp pattern, extract base ID
    //   const baseId = node.id.split('-')[0];
    //   return baseId;
    // });
  }, []);

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

  // Keyboard shortcuts for undo/redo, save and quick search
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
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowQuickSearch(true);
      } else if (e.key === 'Escape' && showQuickSearch) {
        e.preventDefault();
        setShowQuickSearch(false);
        setQuickSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, saveWork, showQuickSearch]);

  // Handle template selection
  const handleTemplateSelect = (template: StackTemplate) => {
    setStackName(template.name);
    setStackDescription(template.description);
    setNodes(template.nodes);
    setConnections(template.connections);
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

  // Check if a node is contained within any container
  const isNodeInContainer = useCallback((nodeId: string): boolean => {
    return nodes.some(node => {
      if ('isContainer' in node && node.isContainer) {
        const container = node as CanvasNode & { containedNodes?: CanvasNode[] };
        return container.containedNodes?.some(contained => contained.id === nodeId) || false;
      }
      return false;
    });
  }, [nodes]);

  // Find a node in the main nodes list or in container containedNodes
  const findNode = useCallback((nodeId: string): CanvasNode | undefined => {
    return findNodeInList(nodeId, nodes);
  }, [nodes]);

  // Helper function to find node in any node list
  const findNodeInList = useCallback((nodeId: string, nodesList: CanvasNode[]): CanvasNode | undefined => {
    // First check main nodes
    const mainNode = nodesList.find(n => n.id === nodeId);
    if (mainNode) return mainNode;

    // Then check inside containers
    for (const node of nodesList) {
      if ('isContainer' in node && node.isContainer) {
        const container = node as CanvasNode & { containedNodes?: CanvasNode[] };
        const containedNode = container.containedNodes?.find(contained => contained.id === nodeId);
        if (containedNode) return containedNode;
      }
    }
    return undefined;
  }, []);

  // Helper function to remove duplicates - ensure node is only in main list OR in a container, not both
  const removeDuplicateNodes = useCallback((nodesList: CanvasNode[]): CanvasNode[] => {
    const containedNodeIds = new Set<string>();
    
    // First, clean up duplicates within each container's containedNodes
    const nodesWithCleanContainers = nodesList.map(node => {
      if ('isContainer' in node && node.isContainer) {
        const container = node as CanvasNode & { containedNodes?: CanvasNode[] };
        if (container.containedNodes && container.containedNodes.length > 0) {
          // Remove duplicates within this container using Map to preserve first occurrence
          const uniqueContainedNodes = Array.from(
            new Map(container.containedNodes.map(n => [n.id, n])).values()
          );
          
          if (uniqueContainedNodes.length !== container.containedNodes.length) {
            console.log(`Removed ${container.containedNodes.length - uniqueContainedNodes.length} duplicate nodes from container ${container.name}`);
          }
          
          // Add to contained IDs set
          uniqueContainedNodes.forEach(contained => {
            containedNodeIds.add(contained.id);
          });
          
          return {
            ...container,
            containedNodes: uniqueContainedNodes
          };
        }
      }
      return node;
    });
    
    // Then filter out main nodes that are also contained in containers
    const cleanedNodes = nodesWithCleanContainers.filter(node => {
      if ('isContainer' in node && node.isContainer) {
        return true; // Keep all containers
      }
      return !containedNodeIds.has(node.id); // Remove main nodes that are also contained
    });
    
    console.log('Removed duplicate nodes. Before:', nodesList.length, 'After:', cleanedNodes.length);
    if (nodesList.length !== cleanedNodes.length) {
      console.log('Contained node IDs:', Array.from(containedNodeIds));
    }
    
    return cleanedNodes;
  }, []);

  // Clean nodes for rendering (memoized to avoid recalculation)
  const cleanNodes = useMemo(() => {
    const cleaned = removeDuplicateNodes(nodes);
    
    // Check for duplicate IDs in final list
    const nodeIds = cleaned.map(n => n.id);
    const duplicateIds = nodeIds.filter((id, index) => nodeIds.indexOf(id) !== index);
    
    if (duplicateIds.length > 0) {
      console.error('🚨 STILL HAVE DUPLICATE NODE IDs:', duplicateIds);
      console.log('All node IDs:', nodeIds);
    }
    
    return cleaned;
  }, [nodes, removeDuplicateNodes]);

  // Handle node selection
  const handleNodeSelect = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node && 'isContainer' in node && node.isContainer) {
      // Si c'est un container, on le sélectionne différemment
      setSelectedContainerId(nodeId);
      setSelectedNodeId(null);
    } else {
      // Si c'est un node normal
      setSelectedNodeId(nodeId);
      setSelectedContainerId(null);
    }
    // Close connection selection when node is selected
    setSelectedConnectionId(null);
  }, [nodes]);

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

  // Handle name change for nodes
  const handleNameChange = useCallback((nodeId: string, newName: string) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId 
        ? { ...node, name: newName } 
        : node
    ));
  }, []);

  // Handle node resources change - works for both main nodes and contained nodes
  const handleNodeResourcesChange = useCallback((nodeId: string, resources: { cpu: string; memory: string; storage?: string; network?: string }) => {
    console.log('handleNodeResourcesChange called with:', nodeId, resources);
    
    setNodes(prevNodes => {
      let wasContainedNode = false;
      
      const updatedNodes = prevNodes.map(node => {
        // Update main node if it matches
        if (node.id === nodeId) {
          return { ...node, resources };
        }
        
        // Update contained node if it's in a container
        if ('isContainer' in node && node.isContainer) {
          const container = node as CanvasNode & { containedNodes?: CanvasNode[] };
          if (container.containedNodes?.some(contained => contained.id === nodeId)) {
            wasContainedNode = true;
            return {
              ...container,
              containedNodes: container.containedNodes.map(contained => 
                contained.id === nodeId ? { ...contained, resources } : contained
              )
            };
          }
        }
        
        return node;
      });
      
      console.log('Updated nodes after resource change:', updatedNodes);
      
      // Clean up any duplicates first
      let cleanedNodes = removeDuplicateNodes(updatedNodes);
      
      // Only call updateContainerNodes if we're updating a main node (not a contained node)
      // This prevents duplication when updating resources of already contained nodes
      if (!wasContainedNode) {
        cleanedNodes = updateContainerNodes(cleanedNodes);
      }
      
      // Final cleanup to ensure no duplicates
      return removeDuplicateNodes(cleanedNodes);
    });
  }, [updateContainerNodes]);

  // Handle opening custom container modal
  const handleOpenCustomContainerModal = useCallback(() => {
    setNodeToConvert(null);
    setShowCustomContainerModal(true);
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
        const isCompact = node.isCompact ?? false;
        
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

  // Handle moving a node into a container
  const handleMoveNodeToContainer = useCallback((nodeId: string, containerId: string) => {
    console.log('🎯 Moving node to container:', nodeId, '→', containerId);
    
    setNodes(prevNodes => {
      // Find the node to move using our helper function
      const nodeToMove = findNodeInList(nodeId, prevNodes);
      if (!nodeToMove) {
        console.error('Node not found:', nodeId);
        return prevNodes;
      }
      
      // Remove the node from canvas
      const nodesWithoutMoved = prevNodes.filter(n => n.id !== nodeId);
      
      // Add the node to the container
      return nodesWithoutMoved.map(node => {
        if (node.id === containerId && 'isContainer' in node && node.isContainer) {
          const container = node as CanvasNode & { isContainer: true; containedNodes?: NodeData[] };
          
          // Create a compact version of the node for the container
          const nodeForContainer: NodeData = {
            ...nodeToMove,
            position: { x: 20 + (container.containedNodes?.length || 0) * 10, y: 20 + (container.containedNodes?.length || 0) * 10 },
            width: 220,
            height: 120,
            isCompact: false
          };
          
          const updatedContainedNodes = [...(container.containedNodes || []), nodeForContainer];
          
          console.log('✅ Moved node', nodeId, 'to container', containerId);
          
          return {
            ...container,
            containedNodes: updatedContainedNodes
          };
        }
        return node;
      });
    });
    
    saveToHistory();
  }, [saveToHistory]);

  // Handle adding component to a specific container (for new components from palette)
  const handleAddComponentToContainer = useCallback((component: NodeData, containerId: string, isMoving = false) => {
    console.log('🚀 Adding component to container:', component.name, 'container:', containerId, 'isMoving:', isMoving);
    
    // If it's an existing node being moved, use the move function
    const existingNode = nodes.find(n => n.id === component.id);
    if (existingNode) {
      console.log('🔄 Existing node detected, using move function');
      handleMoveNodeToContainer(component.id, containerId);
      return;
    }
    
    // Otherwise, create a new node
    const nodeId = `${component.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const nodeToAdd: NodeData = {
      ...component,
      id: nodeId,
      position: { x: 20, y: 20 },
      width: 180,
      height: 60,
      isCompact: true
    };
    
    setNodes(prevNodes => {
      return prevNodes.map(node => {
        if (node.id === containerId && 'isContainer' in node && node.isContainer) {
          const container = node as CanvasNode & { isContainer: true; containedNodes?: NodeData[] };
          const updatedContainedNodes = [...(container.containedNodes || []), nodeToAdd];
          
          console.log('🔄 Added new component to container', containerId);
          
          return {
            ...container,
            containedNodes: updatedContainedNodes
          };
        }
        return node;
      });
    });
    
    saveToHistory();
  }, [nodes, saveToHistory, handleMoveNodeToContainer]);

  // Handle dropping component from palette
  const handleDropComponent = useCallback((component: NodeData, position: { x: number; y: number }) => {
    console.log('🚀 handleDropComponent called with:', component.name, 'at position:', position);
    
    // Check component limit before adding
    if (!checkComponentLimit(getTotalComponentCount())) {
      return;
    }
    
    // Check if containers are allowed (for container components)
    if (component.category === 'containers' && !checkFeatureAccess('canUseContainers')) {
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

    // Generate unique ID for multiple instances
    const uniqueId = `${component.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    let newNode: CanvasNode = {
      ...component,
      id: uniqueId,
      position,
      isCompact: false,
      width: 240,
      height: 140
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
  }, [handleAddSubTechnology, nodes, convertToContainer, handleNodeDrop, checkComponentLimit, checkFeatureAccess]);

  // Add component to canvas
  const handleAddComponent = useCallback((component: NodeData) => {
    // Check component limit before adding
    if (!checkComponentLimit(getTotalComponentCount())) {
      return;
    }
    
    // Check if containers are allowed (for container components)
    if (component.category === 'containers' && !checkFeatureAccess('canUseContainers')) {
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

    // Generate unique ID for multiple instances of the same component
    const uniqueId = `${component.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    let newNode: CanvasNode = {
      ...component,
      id: uniqueId,
      position,
      isCompact: false, // Start in expanded mode
      width: 240,
      height: 140
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
        ports: component.containerType === 'docker' ? ['3000', '3001'] : ['80', '443', '8080'],
        status: 'running'
      };
    }

    setNodes(prev => [...prev, newNode]);
  }, [handleAddSubTechnology, nodes, convertToContainer, checkComponentLimit, checkFeatureAccess]);


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

  // Calculate total component count including those inside containers
  const getTotalComponentCount = useCallback((): number => {
    let totalCount = 0;
    
    nodes.forEach(node => {
      if ('isContainer' in node && node.isContainer) {
        // Count the container itself as 1 component
        totalCount += 1;
        // Count each component inside the container
        const container = node as CanvasNode & { containedNodes?: CanvasNode[] };
        if (container.containedNodes) {
          totalCount += container.containedNodes.length;
        }
      } else {
        // Count regular nodes
        totalCount += 1;
      }
    });
    
    return totalCount;
  }, [nodes]);

  // Calculate stack statistics (for future use - currently unused but keeping for analytics)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const stackStats = useMemo(() => {
    const totalComponentCount = getTotalComponentCount();
    
    const allNodes = nodes.flatMap(node => {
      if ('isContainer' in node && node.isContainer) {
        const container = node as CanvasNode & { containedNodes?: CanvasNode[] };
        return [node, ...(container.containedNodes || [])];
      }
      return [node];
    });
    
    const totalSetupTime = allNodes.reduce((sum, node) => sum + node.setupTimeHours, 0);
    const difficulties = allNodes.map(node => node.difficulty);
    const expertCount = difficulties.filter(d => d === 'expert').length;
    const beginnerCount = difficulties.filter(d => d === 'beginner').length;
    
    let averageDifficulty: 'beginner' | 'intermediate' | 'expert' = 'intermediate';
    if (expertCount > allNodes.length / 2) {
      averageDifficulty = 'expert';
    } else if (beginnerCount > allNodes.length / 2) {
      averageDifficulty = 'beginner';
    }

    const categories = Array.from(new Set(allNodes.map(node => node.category)));
    const hasIncompatible = connections.some(conn => conn.type === 'incompatible');

    return {
      totalSetupTime,
      averageDifficulty,
      categories,
      hasIncompatible,
      nodeCount: totalComponentCount,
      connectionCount: connections.length
    };
  }, [nodes, connections, getTotalComponentCount]);

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

    if (getTotalComponentCount() === 0) {
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
        // Only show share modal if user can share stacks
        if (checkFeatureAccess('canShareStacks')) {
          setShowShareModal(true);
        }
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

  // Handle present (requires auth for saving stack first) - Currently unused but keeping for future features
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePresent = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (getTotalComponentCount() === 0) {
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
    <div className={cn('flex h-full bg-slate-950', className)}>
      {/* 🚀 Nouvelle Sidebar UX/UI 2025 */}
      {showSidebar && (
        <div className="w-80 flex flex-col border-r border-slate-700/50 bg-gradient-to-b from-slate-900/80 to-slate-950/90 backdrop-blur-xl">
          {/* Header Moderne avec Intelligence */}
          <div className="p-4 border-b border-slate-700/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg">
                  <div className="text-white text-sm font-bold">🎯</div>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">Stack Builder</h2>
                  <p className="text-xs text-slate-400">Glissez pour construire</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(false)}
                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-all"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Start pour nouveaux utilisateurs */}
            {getTotalComponentCount() === 0 && (
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-3 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                    <span className="text-white text-xs">✨</span>
                  </div>
                  <span className="text-sm font-medium text-blue-200">Première visite ?</span>
                </div>
                <p className="text-xs text-slate-300 mb-2">Commencez par choisir le type d&apos;app que vous voulez créer :</p>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-xs text-slate-200 transition-all hover:scale-105">
                    🌐 Site Web
                  </button>
                  <button className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-xs text-slate-200 transition-all hover:scale-105">
                    📱 App Mobile
                  </button>
                  <button className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-xs text-slate-200 transition-all hover:scale-105">
                    🚀 API Backend
                  </button>
                  <button className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-xs text-slate-200 transition-all hover:scale-105">
                    🤖 AI/ML App
                  </button>
                </div>
              </div>
            )}

            {/* IA Suggestions intelligentes */}
            {getTotalComponentCount() > 0 && getTotalComponentCount() < 3 && (
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-3 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                    <span className="text-white text-xs">🧠</span>
                  </div>
                  <span className="text-sm font-medium text-emerald-200">Suggestions IA</span>
                </div>
                <p className="text-xs text-slate-300 mb-2">Basé sur votre stack, nous recommandons :</p>
                <div className="space-y-1">
                  <button className="w-full p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-xs text-left text-slate-200 transition-all hover:translate-x-1">
                    + Database pour stocker vos données
                  </button>
                  <button className="w-full p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-xs text-left text-slate-200 transition-all hover:translate-x-1">
                    + Authentication pour sécuriser
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation par Use Cases avec ComponentPalette */}
          <div className="flex-1 overflow-hidden">
            <ComponentPalette
              availableComponents={availableComponents}
              subTechnologies={subTechnologies}
              onAddComponent={handleAddComponent}
              onOpenCustomContainerModal={handleOpenCustomContainerModal}
              usedComponentIds={usedComponentIds}
              className="h-full"
            />
          </div>

          {/* Footer avec shortcuts et tips */}
          <div className="border-t border-slate-700/30 p-3 bg-slate-900/50">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-2 text-slate-400">
                <span>💡</span>
                <span>Glissez ou cliquez pour ajouter</span>
              </div>
              <button 
                onClick={() => setShowTemplatesModal(true)}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Voir templates →
              </button>
            </div>
            <div className="flex items-center justify-center">
              <button
                onClick={() => setShowQuickSearch(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-slate-300 hover:text-slate-200 transition-all hover:scale-105"
              >
                <span>🔍</span>
                <span className="text-xs">Recherche rapide</span>
                <div className="px-1.5 py-0.5 bg-slate-700 rounded text-xs">⌘K</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Subtle Modern Topbar */}
        <div className="relative border-b border-slate-700 bg-slate-900/60 backdrop-blur-sm">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left Section - Project Info */}
            <div className="flex items-center gap-4">
              {!showSidebar && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(true)}
                  className="text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-all"
                >
                  <div className="w-4 h-4 mr-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs">🎯</span>
                  </div>
                  Stack Builder
                </Button>
              )}
              
              <div className="flex items-center gap-3">
                {/* Subtle Project Icon */}
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <div className="text-blue-400 text-sm">⚡</div>
                </div>
                
                {/* Editable Project Details */}
                <div className="flex items-center gap-3">
                  {/* Editable Title */}
                  <input
                    type="text"
                    value={stackName}
                    onChange={(e) => setStackName(e.target.value)}
                    placeholder="Nom du stack"
                    className="bg-transparent text-slate-200 font-medium text-base border-none outline-none hover:bg-slate-800/50 focus:bg-slate-800 px-2 py-1 rounded transition-colors min-w-[200px]"
                  />
                  
                  {/* Clickable Public/Private Badge */}
                  {user && (
                    <button
                      onClick={() => setShowVisibilityModal(true)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors hover:opacity-80 ${
                        isPublic 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                      title="Cliquez pour changer la visibilité"
                    >
                      {isPublic ? (
                        <>
                          <Globe className="w-3 h-3" />
                          Public
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" />
                          Privé
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Unsaved Changes Indicator */}
              {hasUnsavedChanges && (
                <div className="flex items-center gap-1 text-xs text-orange-400">
                  <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
                  Non sauvegardé
                </div>
              )}
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-2">
              {/* Quick Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={undo}
                  disabled={!canUndo}
                  title="Annuler (Ctrl+Z)"
                  className="h-10 w-10 p-0 text-slate-400 hover:text-slate-200 disabled:opacity-30"
                >
                  <Undo className="h-10 w-10" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={redo}
                  disabled={!canRedo}
                  title="Refaire (Ctrl+Shift+Z)"
                  className="h-10 w-10 p-0 text-slate-400 hover:text-slate-200 disabled:opacity-30"
                >
                  <Redo className="h-10 w-10" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={saveWork}
                  title="Sauvegarder local (Ctrl+S)"
                  className={`h-10 w-10 p-0 hover:text-slate-200 ${
                    hasUnsavedChanges ? 'text-orange-400' : 'text-slate-400'
                  }`}
                >
                  <Save className="h-10 w-10" />
                </Button>
              </div>
              
              <div className="w-px h-4 bg-slate-600" />
              
              {/* Secondary Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (checkExportLimit(0)) { // TODO: track actual export count
                      setShowExportModal(true);
                    }
                  }}
                  disabled={getTotalComponentCount() === 0}
                  className="text-slate-400 hover:text-slate-200 disabled:opacity-30"
                  title="Exporter le stack"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowTemplatesModal(true)}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <Layers className="h-4 w-4 mr-1" />
                  Templates
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPresentationMode(true)}
                  disabled={getTotalComponentCount() === 0}
                  className="text-slate-400 hover:text-slate-200 disabled:opacity-30"
                >
                  <Monitor className="h-4 w-4 mr-1" />
                  Présenter
                </Button>
              </div>
              
              <div className="w-px h-4 bg-slate-600" />
              
              {/* Primary Save Action */}
              <Button
                onClick={handleSave}
                disabled={!user || !stackName?.trim() || getTotalComponentCount() === 0}
                className={`bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 ${
                  (!user || !stackName?.trim() || getTotalComponentCount() === 0) 
                    ? 'opacity-50 cursor-not-allowed' 
                    : ''
                }`}
                title={!user ? "Connexion requise" : "Sauvegarder dans le cloud"}
              >
                {!user ? (
                  <>
                    <Lock className="h-3 w-3 mr-1" />
                    Connexion
                  </>
                ) : (
                  <>
                    <Share2 className="h-3 w-3 mr-1" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </div>
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

        {/* Node Toolbar - Different toolbar based on whether node is in container */}
        {selectedNodeId && (() => {
          const selectedNode = nodes.find(n => n.id === selectedNodeId);
          const nodeInContainer = isNodeInContainer(selectedNodeId);
          
          if (nodeInContainer) {
            // Open resource configuration modal for nodes inside containers
            if (!showResourceConfigModal) {
              setResourceConfigNodeId(selectedNodeId);
              setShowResourceConfigModal(true);
              setSelectedNodeId(null);
            }
            return null;
          } else {
            // Show visual customization for standalone nodes
            return (
              <NodeToolbar
                nodeId={selectedNodeId}
                nodeName={selectedNode?.name || 'Unknown'}
                currentStyle={selectedNode?.customStyle}
                onStyleChange={handleNodeStyleChange}
                onClose={() => setSelectedNodeId(null)}
              />
            );
          }
        })()}

        {/* Container Config Bar */}
        {selectedContainerId && (() => {
          const container = nodes.find(n => n.id === selectedContainerId);
          if (!container || !('isContainer' in container) || !container.isContainer) return null;
          
          const suggestedSize = (() => {
            const baseHeight = 140;
            const serviceHeight = 50;
            const containedNodes = (container as CanvasNode & { containedNodes?: CanvasNode[] }).containedNodes || [];
            const servicesHeight = containedNodes.length * serviceHeight;
            const adaptiveHeight = baseHeight + servicesHeight + 20;
            const adaptiveWidth = Math.max(280, containedNodes.length > 0 ? 320 : 300);
            return { width: adaptiveWidth, height: Math.min(400, adaptiveHeight) };
          })();
          
          const containerType = (container as CanvasNode & { containerType?: string }).containerType || 'docker';
          const minMaxSize = (() => {
            switch (containerType) {
              case 'kubernetes':
                return { minWidth: 250, minHeight: 180, maxWidth: 600, maxHeight: 450 };
              case 'docker':
                return { minWidth: 220, minHeight: 160, maxWidth: 550, maxHeight: 400 };
              default:
                return { minWidth: 240, minHeight: 170, maxWidth: 580, maxHeight: 420 };
            }
          })();
          
          return (
            <ContainerConfigBar
              containerId={selectedContainerId}
              containerName={container.name}
              containerType={containerType}
              currentWidth={container.width || suggestedSize.width}
              currentHeight={container.height || suggestedSize.height}
              minWidth={minMaxSize.minWidth}
              maxWidth={minMaxSize.maxWidth}
              minHeight={minMaxSize.minHeight}
              maxHeight={minMaxSize.maxHeight}
              suggestedWidth={suggestedSize.width}
              suggestedHeight={suggestedSize.height}
              onResize={(id, width, height) => {
                console.log('🎯 VisualStackBuilder: onResize called for', id, 'new dimensions:', width, 'x', height);
                const updatedNodes = nodes.map(n => 
                  n.id === id ? { ...n, width, height } : n
                );
                console.log('🎯 VisualStackBuilder: setting updated nodes', updatedNodes.find(n => n.id === id));
                setNodes(updatedNodes);
              }}
              onClose={() => setSelectedContainerId(null)}
              onNameChange={handleNameChange}
            />
          );
        })()}

        {/* Canvas */}
        <ContainerViewContext.Provider value={containerViewMode}>
          <ReactFlowCanvas
            nodes={cleanNodes}
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
          onNameChange={handleNameChange}
          onNodeSelect={handleNodeSelect}
          onDocumentationSave={handleDocumentationSave}
          onAddSubTechnology={handleAddSubTechnology}
          onDropComponent={handleDropComponent}
          onAddComponentToContainer={handleAddComponentToContainer}
          onMoveNodeToContainer={handleMoveNodeToContainer}
          onRemoveFromContainer={handleRemoveFromContainer}
          availableSubTechnologies={subTechnologies}
          totalComponentCount={getTotalComponentCount()}
          componentLimit={limits.maxComponentsPerStack}
          planName={subscription?.plan}
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

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        stackId={savedStackId || ''}
        stackName={stackName || 'Untitled Stack'}
      />

      {/* Resource Configuration Modal */}
      {resourceConfigNodeId && (() => {
        const configNode = findNode(resourceConfigNodeId);
        console.log('Modal config node:', configNode); // Debug
        
        return (
          <ResourceConfigModal
            isOpen={showResourceConfigModal}
            onClose={() => {
              setShowResourceConfigModal(false);
              setResourceConfigNodeId(null);
            }}
            onSave={(resources, envVars) => {
              console.log('Saving resources for node:', resourceConfigNodeId, resources); // Debug
              handleNodeResourcesChange(resourceConfigNodeId, resources);
              // TODO: Handle envVars if needed in the future
              console.log('Environment variables:', envVars);
            }}
            initialResources={configNode?.resources}
            componentName={configNode?.name || 'Service'}
          />
        );
      })()}

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

      {/* Simple Save Notification */}
      {showSavedNotification && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <Save className="h-10 w-10" />
            <span className="text-sm font-medium">Sauvegardé !</span>
          </div>
        </motion.div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={handleCloseUpgradeModal}
        reason={upgradeModal.reason as 'components' | 'containers' | 'stacks' | 'exports' | 'styling' | 'sharing'}
        currentCount={upgradeModal.currentCount}
        limit={upgradeModal.limit}
      />

      {/* Quick Search Modal */}
      {showQuickSearch && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 pt-[10vh]"
             onClick={() => {
               setShowQuickSearch(false);
               setQuickSearchQuery('');
             }}>
          <div className="w-full max-w-2xl mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
              {/* Header avec search */}
              <div className="flex items-center gap-3 p-4 border-b border-slate-700/50">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-sm">🔍</span>
                </div>
                <input
                  type="text"
                  value={quickSearchQuery}
                  onChange={(e) => setQuickSearchQuery(e.target.value)}
                  placeholder="Rechercher un composant..."
                  className="flex-1 bg-transparent text-white placeholder-slate-400 text-lg outline-none"
                  autoFocus
                />
                <div className="text-slate-500 text-sm">Échap pour fermer</div>
              </div>

              {/* Catégories rapides */}
              <div className="p-4 border-b border-slate-700/50">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-slate-400 text-sm">Catégories populaires</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button 
                    onClick={() => setQuickSearchQuery('frontend')}
                    className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-left transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-4 h-4 bg-pink-500 rounded"></div>
                      <span className="text-sm font-medium text-slate-200">Frontend</span>
                    </div>
                    <span className="text-xs text-slate-400">{availableComponents.filter(c => c.category === 'frontend').length} outils</span>
                  </button>
                  <button 
                    onClick={() => setQuickSearchQuery('backend')}
                    className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-left transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-sm font-medium text-slate-200">Backend</span>
                    </div>
                    <span className="text-xs text-slate-400">{availableComponents.filter(c => c.category === 'backend').length} outils</span>
                  </button>
                  <button 
                    onClick={() => setQuickSearchQuery('database')}
                    className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-left transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                      <span className="text-sm font-medium text-slate-200">Database</span>
                    </div>
                    <span className="text-xs text-slate-400">{availableComponents.filter(c => c.category === 'database').length} outils</span>
                  </button>
                  <button 
                    onClick={() => setQuickSearchQuery('devops')}
                    className="p-3 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-left transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-4 h-4 bg-purple-500 rounded"></div>
                      <span className="text-sm font-medium text-slate-200">DevOps</span>
                    </div>
                    <span className="text-xs text-slate-400">{availableComponents.filter(c => c.category === 'devops').length} outils</span>
                  </button>
                </div>
              </div>

              {/* Résultats de recherche */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-slate-400 text-sm">
                    {quickSearchQuery ? 'Résultats de recherche' : 'Composants populaires'}
                  </span>
                  {loadingCommunity && (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(() => {
                    // Filtrer les composants selon la recherche (officiels + communautaires)
                    const allComponents = [
                      ...availableComponents.map(comp => ({ ...comp, isCommunity: false })),
                      ...communityComponents.map(comp => ({
                        id: comp.id,
                        name: comp.name,
                        category: comp.category,
                        description: comp.description,
                        setupTimeHours: comp.setupTimeHours,
                        pricing: comp.pricing,
                        difficulty: comp.difficulty,
                        author: comp.author?.name || 'Anonyme',
                        rating: comp.rating,
                        usageCount: comp.usageCount,
                        isCommunity: true
                      }))
                    ];

                    const filtered = quickSearchQuery 
                      ? allComponents.filter(component => 
                          component.name.toLowerCase().includes(quickSearchQuery.toLowerCase()) ||
                          component.description?.toLowerCase().includes(quickSearchQuery.toLowerCase()) ||
                          component.category.toLowerCase().includes(quickSearchQuery.toLowerCase()) ||
                          (component.author && component.author.toLowerCase().includes(quickSearchQuery.toLowerCase()))
                        )
                      : allComponents.slice(0, 6);
                    
                    if (filtered.length === 0) {
                      return (
                        <div className="text-center py-8 text-slate-400">
                          <div className="text-4xl mb-2">🔍</div>
                          <p>Aucun composant trouvé pour &quot;{quickSearchQuery}&quot;</p>
                          <p className="text-sm mt-2">Essayez avec d&apos;autres mots-clés</p>
                        </div>
                      );
                    }
                    
                    return filtered.map(component => (
                    <button
                      key={component.id}
                      onClick={() => {
                        handleAddComponent(component);
                        setShowQuickSearch(false);
                        setQuickSearchQuery('');
                      }}
                      className="w-full p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-xl text-left transition-all hover:scale-[1.02] group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm ${
                          component.isCommunity ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
                          component.category === 'frontend' ? 'bg-gradient-to-br from-pink-500 to-rose-600' :
                          component.category === 'backend' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                          component.category === 'database' ? 'bg-gradient-to-br from-emerald-500 to-green-600' :
                          'bg-gradient-to-br from-purple-500 to-violet-600'
                        }`}>
                          {component.isCommunity ? '🌐' :
                           component.category === 'frontend' ? '🎨' :
                           component.category === 'backend' ? '⚙️' :
                           component.category === 'database' ? '💾' : '🚀'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-200 group-hover:text-white">{component.name}</span>
                            {component.isCommunity && (
                              <Badge variant="secondary" size="sm" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                                Community
                              </Badge>
                            )}
                            <span className="text-xs text-slate-500 capitalize">{component.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-slate-400 truncate flex-1">{component.description}</p>
                            {component.isCommunity && component.rating && (
                              <div className="flex items-center gap-1">
                                <span className="text-yellow-400">⭐</span>
                                <span className="text-xs text-slate-300">{component.rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                          {component.isCommunity && component.author && (
                            <p className="text-xs text-slate-500 mt-1">
                              Par {component.author}
                            </p>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">
                          {component.setupTimeHours}h
                        </div>
                      </div>
                    </button>
                    ));
                  })()}
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-slate-900/50 border-t border-slate-700/50">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>💡 Tip: Utilisez les flèches ↑↓ pour naviguer</span>
                  <span>⌘K pour ouvrir</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};