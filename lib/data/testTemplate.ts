import { NodeData } from '@/components/ui/VisualBuilder/CanvasNode';

export interface TestTemplate {
  name: string;
  description: string;
  nodes: Array<NodeData & { 
    position: { x: number; y: number }; 
    isCompact?: boolean;
    width?: number;
    height?: number;
    documentation?: string;
    // Container properties
    isContainer?: boolean;
    containerType?: 'docker' | 'kubernetes';
    containedNodes?: NodeData[];
    connectedServices?: {
      id: string;
      name: string;
      port: string;
      status: 'connected' | 'disconnected' | 'pending';
    }[];
    ports?: string[];
    status?: 'running' | 'stopped' | 'pending';
  }>;
  connections: Array<{ 
    id: string; 
    sourceNodeId: string; 
    targetNodeId: string; 
    type: string; 
  }>;
}

export const dockerTestTemplate: TestTemplate = {
  name: "Test Docker + React + Node.js",
  description: "Template de test avec Docker contenant React et Node.js pour tester le drag & drop et la configuration",
  nodes: [
    // Docker Container - avec propriétés de conteneur
    {
      id: 'docker',
      name: 'Docker Container',
      category: 'devops',
      description: 'Container Docker pour héberger les applications',
      setupTimeHours: 2,
      difficulty: 'intermediate',
      pricing: 'free',
      isMainTechnology: true,
      // Container properties
      isContainer: true,
      containerType: 'docker',
      containedNodes: [],
      connectedServices: [],
      ports: ['3000', '3001'],
      status: 'running',
      // Layout properties
      position: { x: 100, y: 100 },
      width: 500,
      height: 400,
      isCompact: false,
      resources: {
        cpu: '0.5 cores',
        memory: '256MB',
        storage: '1GB',
        network: '10Mbps'
      },
      environmentVariables: {
        'DOCKER_HOST': 'unix:///var/run/docker.sock',
        'COMPOSE_PROJECT_NAME': 'test-app'
      }
    },
    // React App
    {
      id: 'react-test',
      name: 'React Frontend',
      category: 'frontend',
      description: 'Application React pour les interfaces utilisateur',
      setupTimeHours: 2,
      difficulty: 'intermediate',
      pricing: 'free',
      isMainTechnology: true,
      position: { x: 700, y: 100 },
      width: 250,
      height: 120,
      isCompact: false,
      resources: {
        cpu: '1 core',
        memory: '512MB',
        storage: '200MB',
        network: '50Mbps'
      },
      environmentVariables: {
        'NODE_ENV': 'development',
        'REACT_APP_API_URL': 'http://localhost:3001',
        'PORT': '3000'
      }
    },
    // Node.js Backend
    {
      id: 'nodejs-test',
      name: 'Node.js Backend',
      category: 'backend',
      description: 'Serveur Node.js pour l\'API',
      setupTimeHours: 2,
      difficulty: 'intermediate',
      pricing: 'free',
      isMainTechnology: true,
      position: { x: 700, y: 300 },
      width: 250,
      height: 120,
      isCompact: false,
      resources: {
        cpu: '2 cores',
        memory: '1GB',
        storage: '300MB',
        network: '100Mbps'
      },
      environmentVariables: {
        'NODE_ENV': 'development',
        'PORT': '3001',
        'API_SECRET': 'your-secret-key',
        'DATABASE_URL': 'postgresql://localhost:5432/myapp'
      }
    },
    // PostgreSQL Database
    {
      id: 'postgres-test',
      name: 'PostgreSQL',
      category: 'database',
      description: 'Base de données PostgreSQL',
      setupTimeHours: 3,
      difficulty: 'intermediate',
      pricing: 'free',
      isMainTechnology: true,
      position: { x: 1000, y: 200 },
      width: 250,
      height: 150,
      isCompact: false,
      resources: {
        cpu: '1 core',
        memory: '1GB',
        storage: '10GB',
        network: '50Mbps'
      },
      environmentVariables: {
        'POSTGRES_DB': 'myapp',
        'POSTGRES_USER': 'admin',
        'POSTGRES_PASSWORD': 'secret123',
        'POSTGRES_HOST': 'localhost',
        'POSTGRES_PORT': '5432'
      }
    }
  ],
  connections: [
    {
      id: 'react-node-connection',
      sourceNodeId: 'react-test',
      targetNodeId: 'nodejs-test',
      type: 'compatible'
    },
    {
      id: 'node-postgres-connection',
      sourceNodeId: 'nodejs-test',
      targetNodeId: 'postgres-test',
      type: 'compatible'
    }
  ]
};

// Helper function to load the test template
export const loadDockerTestTemplate = (): TestTemplate => {
  return dockerTestTemplate;
};