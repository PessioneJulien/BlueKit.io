import { NodeData, SubTechnology } from '@/components/ui/VisualBuilder/CanvasNode';

export interface StackTemplate {
  id: string;
  name: string;
  description: string;
  category: 'fullstack' | 'frontend' | 'backend' | 'mobile' | 'ai' | 'devops';
  nodes: Array<NodeData & {
    position: { x: number; y: number };
    width?: number;
    height?: number;
  }>;
  connections: Array<{
    id: string;
    sourceNodeId: string;
    targetNodeId: string;
    type: 'compatible' | 'incompatible' | 'neutral';
  }>;
}

// Sous-technologies réutilisables
const commonTools: Record<string, SubTechnology> = {
  tailwind: {
    id: 'tailwind',
    name: 'Tailwind CSS',
    type: 'styling',
    description: 'Utility-first CSS framework',
    setupTimeHours: 1,
    difficulty: 'beginner',
    pricing: 'free'
  },
  jest: {
    id: 'jest',
    name: 'Jest',
    type: 'testing',
    description: 'JavaScript testing framework',
    setupTimeHours: 2,
    difficulty: 'intermediate',
    pricing: 'free'
  },
  eslint: {
    id: 'eslint',
    name: 'ESLint',
    type: 'linting',
    description: 'Code linting tool',
    setupTimeHours: 1,
    difficulty: 'beginner',
    pricing: 'free'
  },
  prettier: {
    id: 'prettier',
    name: 'Prettier',
    type: 'linting',
    description: 'Code formatter',
    setupTimeHours: 0.5,
    difficulty: 'beginner',
    pricing: 'free'
  }
};

export const stackTemplates: StackTemplate[] = [
  {
    id: 'mern-stack',
    name: 'MERN Stack',
    description: 'MongoDB, Express, React, Node.js - Classic JavaScript full-stack',
    category: 'fullstack',
    nodes: [
      {
        id: 'react',
        name: 'React',
        category: 'frontend',
        description: 'A JavaScript library for building user interfaces',
        setupTimeHours: 2,
        difficulty: 'intermediate',
        pricing: 'free',
        position: { x: 100, y: 100 },
        width: 280,
        height: 150,
        isMainTechnology: true,
        canAcceptSubTech: ['styling', 'testing', 'state-management', 'routing'],
        subTechnologies: [commonTools.tailwind, commonTools.jest],
        compatibleWith: ['nodejs', 'express'],
      },
      {
        id: 'nodejs',
        name: 'Node.js',
        category: 'backend',
        description: 'JavaScript runtime built on Chrome\'s V8 engine',
        setupTimeHours: 2,
        difficulty: 'intermediate',
        pricing: 'free',
        position: { x: 450, y: 100 },
        width: 280,
        height: 150,
        isMainTechnology: true,
        canAcceptSubTech: ['testing', 'linting'],
        subTechnologies: [commonTools.eslint, commonTools.jest],
        compatibleWith: ['react', 'express', 'mongodb'],
      },
      {
        id: 'express',
        name: 'Express.js',
        category: 'backend',
        description: 'Fast, unopinionated web framework for Node.js',
        setupTimeHours: 1,
        difficulty: 'beginner',
        pricing: 'free',
        position: { x: 450, y: 300 },
        width: 280,
        height: 120,
        isMainTechnology: true,
        compatibleWith: ['nodejs', 'mongodb'],
      },
      {
        id: 'mongodb',
        name: 'MongoDB',
        category: 'database',
        description: 'Document-based NoSQL database',
        setupTimeHours: 2,
        difficulty: 'beginner',
        pricing: 'freemium',
        position: { x: 800, y: 200 },
        width: 250,
        height: 120,
        isMainTechnology: true,
        canAcceptSubTech: ['testing'],
        compatibleWith: ['nodejs', 'express'],
      }
    ],
    connections: [
      {
        id: 'react-node',
        sourceNodeId: 'react',
        targetNodeId: 'nodejs',
        type: 'compatible'
      },
      {
        id: 'node-express',
        sourceNodeId: 'nodejs',
        targetNodeId: 'express',
        type: 'compatible'
      },
      {
        id: 'express-mongo',
        sourceNodeId: 'express',
        targetNodeId: 'mongodb',
        type: 'compatible'
      }
    ]
  },
  {
    id: 'nextjs-supabase',
    name: 'Next.js + Supabase',
    description: 'Modern full-stack with Next.js and Supabase (PostgreSQL + Auth)',
    category: 'fullstack',
    nodes: [
      {
        id: 'nextjs',
        name: 'Next.js',
        category: 'frontend',
        description: 'The React Framework for Production',
        setupTimeHours: 3,
        difficulty: 'intermediate',
        pricing: 'free',
        position: { x: 100, y: 150 },
        width: 300,
        height: 160,
        isMainTechnology: true,
        canAcceptSubTech: ['styling', 'testing', 'deployment'],
        subTechnologies: [commonTools.tailwind, commonTools.jest],
        compatibleWith: ['supabase', 'vercel'],
      },
      {
        id: 'supabase',
        name: 'Supabase',
        category: 'backend',
        description: 'Open source Firebase alternative with PostgreSQL',
        setupTimeHours: 2,
        difficulty: 'beginner',
        pricing: 'freemium',
        position: { x: 500, y: 150 },
        width: 280,
        height: 160,
        isMainTechnology: true,
        compatibleWith: ['nextjs', 'postgresql'],
      },
      {
        id: 'vercel',
        name: 'Vercel',
        category: 'devops',
        description: 'Platform for frontend frameworks and static sites',
        setupTimeHours: 1,
        difficulty: 'beginner',
        pricing: 'freemium',
        position: { x: 300, y: 350 },
        width: 250,
        height: 120,
        isMainTechnology: true,
        compatibleWith: ['nextjs'],
      }
    ],
    connections: [
      {
        id: 'next-supa',
        sourceNodeId: 'nextjs',
        targetNodeId: 'supabase',
        type: 'compatible'
      },
      {
        id: 'next-vercel',
        sourceNodeId: 'nextjs',
        targetNodeId: 'vercel',
        type: 'compatible'
      }
    ]
  },
  {
    id: 'jamstack',
    name: 'JAMStack',
    description: 'JavaScript, APIs, and Markup - Modern static site architecture',
    category: 'frontend',
    nodes: [
      {
        id: 'gatsby',
        name: 'Gatsby',
        category: 'frontend',
        description: 'Blazing fast modern site generator for React',
        setupTimeHours: 3,
        difficulty: 'intermediate',
        pricing: 'free',
        position: { x: 100, y: 100 },
        width: 280,
        height: 150,
        isMainTechnology: true,
        canAcceptSubTech: ['styling', 'testing'],
        subTechnologies: [commonTools.tailwind],
        compatibleWith: ['netlify', 'contentful'],
      },
      {
        id: 'contentful',
        name: 'Contentful',
        category: 'backend',
        description: 'Headless CMS for digital content',
        setupTimeHours: 2,
        difficulty: 'beginner',
        pricing: 'freemium',
        position: { x: 450, y: 100 },
        width: 280,
        height: 150,
        isMainTechnology: true,
        compatibleWith: ['gatsby', 'netlify'],
      },
      {
        id: 'netlify',
        name: 'Netlify',
        category: 'devops',
        description: 'All-in-one platform for automating modern web projects',
        setupTimeHours: 1,
        difficulty: 'beginner',
        pricing: 'freemium',
        position: { x: 275, y: 300 },
        width: 250,
        height: 120,
        isMainTechnology: true,
        compatibleWith: ['gatsby', 'contentful'],
      }
    ],
    connections: [
      {
        id: 'gatsby-contentful',
        sourceNodeId: 'gatsby',
        targetNodeId: 'contentful',
        type: 'compatible'
      },
      {
        id: 'gatsby-netlify',
        sourceNodeId: 'gatsby',
        targetNodeId: 'netlify',
        type: 'compatible'
      }
    ]
  },
  {
    id: 'mean-stack',
    name: 'MEAN Stack',
    description: 'MongoDB, Express, Angular, Node.js - Enterprise JavaScript stack',
    category: 'fullstack',
    nodes: [
      {
        id: 'angular',
        name: 'Angular',
        category: 'frontend',
        description: 'Platform for building mobile and desktop web applications',
        setupTimeHours: 4,
        difficulty: 'expert',
        pricing: 'free',
        position: { x: 100, y: 100 },
        width: 280,
        height: 150,
        isMainTechnology: true,
        canAcceptSubTech: ['styling', 'testing'],
        compatibleWith: ['nodejs', 'express'],
        incompatibleWith: ['react', 'vue'],
      },
      {
        id: 'nodejs',
        name: 'Node.js',
        category: 'backend',
        description: 'JavaScript runtime built on Chrome\'s V8 engine',
        setupTimeHours: 2,
        difficulty: 'intermediate',
        pricing: 'free',
        position: { x: 450, y: 100 },
        width: 280,
        height: 150,
        isMainTechnology: true,
        canAcceptSubTech: ['testing', 'linting'],
        subTechnologies: [commonTools.eslint],
        compatibleWith: ['angular', 'express', 'mongodb'],
      },
      {
        id: 'express',
        name: 'Express.js',
        category: 'backend',
        description: 'Fast, unopinionated web framework for Node.js',
        setupTimeHours: 1,
        difficulty: 'beginner',
        pricing: 'free',
        position: { x: 450, y: 300 },
        width: 280,
        height: 120,
        isMainTechnology: true,
        compatibleWith: ['nodejs', 'mongodb'],
      },
      {
        id: 'mongodb',
        name: 'MongoDB',
        category: 'database',
        description: 'Document-based NoSQL database',
        setupTimeHours: 2,
        difficulty: 'beginner',
        pricing: 'freemium',
        position: { x: 800, y: 200 },
        width: 250,
        height: 120,
        isMainTechnology: true,
        compatibleWith: ['nodejs', 'express'],
      }
    ],
    connections: [
      {
        id: 'angular-node',
        sourceNodeId: 'angular',
        targetNodeId: 'nodejs',
        type: 'compatible'
      },
      {
        id: 'node-express',
        sourceNodeId: 'nodejs',
        targetNodeId: 'express',
        type: 'compatible'
      },
      {
        id: 'express-mongo',
        sourceNodeId: 'express',
        targetNodeId: 'mongodb',
        type: 'compatible'
      }
    ]
  },
  {
    id: 'flutter-firebase',
    name: 'Flutter + Firebase',
    description: 'Cross-platform mobile app with Flutter and Firebase backend',
    category: 'mobile',
    nodes: [
      {
        id: 'flutter',
        name: 'Flutter',
        category: 'mobile',
        description: 'Google\'s UI toolkit for building natively compiled applications',
        setupTimeHours: 3,
        difficulty: 'intermediate',
        pricing: 'free',
        position: { x: 100, y: 150 },
        width: 280,
        height: 150,
        isMainTechnology: true,
        canAcceptSubTech: ['testing'],
        compatibleWith: ['firebase'],
      },
      {
        id: 'firebase',
        name: 'Firebase',
        category: 'backend',
        description: 'Google\'s mobile and web application development platform',
        setupTimeHours: 2,
        difficulty: 'beginner',
        pricing: 'freemium',
        position: { x: 450, y: 150 },
        width: 280,
        height: 150,
        isMainTechnology: true,
        compatibleWith: ['flutter'],
      }
    ],
    connections: [
      {
        id: 'flutter-firebase',
        sourceNodeId: 'flutter',
        targetNodeId: 'firebase',
        type: 'compatible'
      }
    ]
  },
  {
    id: 'docker-microservices',
    name: 'Docker Microservices',
    description: 'Microservices architecture avec containers Docker',
    category: 'devops',
    nodes: [
      {
        id: 'nginx-container',
        name: 'Nginx (Docker)',
        category: 'devops',
        description: 'Reverse proxy et load balancer dans un container Docker',
        setupTimeHours: 2,
        difficulty: 'intermediate',
        pricing: 'free',
        position: { x: 100, y: 100 },
        width: 400,
        height: 200,
        isMainTechnology: true,
        isContainer: true,
        containerType: 'docker',
        ports: ['80', '443'],
        resources: {
          cpu: '0.5 cores',
          memory: '256MB',
          storage: '1GB',
          network: '100Mbps'
        },
        compatibleWith: ['api-container', 'frontend-container'],
      },
      {
        id: 'api-container',
        name: 'Node.js API (Docker)',
        category: 'backend',
        description: 'API Node.js/Express dans un container Docker',
        setupTimeHours: 3,
        difficulty: 'intermediate',
        pricing: 'free',
        position: { x: 550, y: 100 },
        width: 400,
        height: 200,
        isMainTechnology: true,
        isContainer: true,
        containerType: 'docker',
        ports: ['3000', '3001'],
        resources: {
          cpu: '1 cores',
          memory: '512MB',
          storage: '2GB',
          network: '50Mbps'
        },
        canAcceptSubTech: ['testing', 'linting'],
        subTechnologies: [commonTools.eslint],
        compatibleWith: ['nginx-container', 'redis-container', 'postgres-container'],
      },
      {
        id: 'redis-container',
        name: 'Redis (Docker)',
        category: 'database',
        description: 'Cache Redis dans un container Docker',
        setupTimeHours: 1,
        difficulty: 'beginner',
        pricing: 'free',
        position: { x: 1000, y: 100 },
        width: 300,
        height: 150,
        isMainTechnology: true,
        isContainer: true,
        containerType: 'docker',
        ports: ['6379'],
        resources: {
          cpu: '0.2 cores',
          memory: '128MB',
          storage: '500MB',
          network: '10Mbps'
        },
        compatibleWith: ['api-container'],
      },
      {
        id: 'postgres-container',
        name: 'PostgreSQL (Docker)',
        category: 'database',
        description: 'Base de données PostgreSQL dans un container Docker',
        setupTimeHours: 2,
        difficulty: 'beginner',
        pricing: 'free',
        position: { x: 775, y: 350 },
        width: 350,
        height: 150,
        isMainTechnology: true,
        isContainer: true,
        containerType: 'docker',
        ports: ['5432'],
        resources: {
          cpu: '0.5 cores',
          memory: '256MB',
          storage: '5GB',
          network: '20Mbps'
        },
        compatibleWith: ['api-container'],
      }
    ],
    connections: [
      {
        id: 'nginx-api',
        sourceNodeId: 'nginx-container',
        targetNodeId: 'api-container',
        type: 'compatible'
      },
      {
        id: 'api-redis',
        sourceNodeId: 'api-container',
        targetNodeId: 'redis-container',
        type: 'compatible'
      },
      {
        id: 'api-postgres',
        sourceNodeId: 'api-container',
        targetNodeId: 'postgres-container',
        type: 'compatible'
      }
    ]
  },
  {
    id: 'kubernetes-cluster',
    name: 'Kubernetes Cluster',
    description: 'Architecture complète avec orchestration Kubernetes',
    category: 'devops',
    nodes: [
      {
        id: 'k8s-frontend-cluster',
        name: 'Frontend Cluster (K8s)',
        category: 'devops',
        description: 'Cluster Kubernetes pour les applications frontend',
        setupTimeHours: 5,
        difficulty: 'expert',
        pricing: 'free',
        position: { x: 100, y: 100 },
        width: 600,
        height: 300,
        isMainTechnology: true,
        isContainer: true,
        containerType: 'kubernetes',
        ports: ['80', '443', '8080'],
        resources: {
          cpu: '2 cores',
          memory: '2GB',
          storage: '10GB',
          network: '500Mbps'
        },
        compatibleWith: ['k8s-backend-cluster', 'k8s-monitoring'],
      },
      {
        id: 'k8s-backend-cluster',
        name: 'Backend Cluster (K8s)',
        category: 'devops',
        description: 'Cluster Kubernetes pour les services backend',
        setupTimeHours: 6,
        difficulty: 'expert',
        pricing: 'free',
        position: { x: 750, y: 100 },
        width: 600,
        height: 300,
        isMainTechnology: true,
        isContainer: true,
        containerType: 'kubernetes',
        ports: ['3000', '5000', '8000'],
        resources: {
          cpu: '4 cores',
          memory: '4GB',
          storage: '20GB',
          network: '1Gbps'
        },
        compatibleWith: ['k8s-frontend-cluster', 'k8s-database-cluster', 'k8s-monitoring'],
      },
      {
        id: 'k8s-database-cluster',
        name: 'Database Cluster (K8s)',
        category: 'database',
        description: 'Cluster Kubernetes pour les bases de données',
        setupTimeHours: 4,
        difficulty: 'expert',
        pricing: 'free',
        position: { x: 425, y: 450 },
        width: 550,
        height: 250,
        isMainTechnology: true,
        isContainer: true,
        containerType: 'kubernetes',
        ports: ['5432', '6379', '27017'],
        resources: {
          cpu: '3 cores',
          memory: '6GB',
          storage: '100GB',
          network: '200Mbps'
        },
        compatibleWith: ['k8s-backend-cluster'],
      },
      {
        id: 'k8s-monitoring',
        name: 'Monitoring Stack (K8s)',
        category: 'devops',
        description: 'Stack de monitoring avec Prometheus et Grafana',
        setupTimeHours: 3,
        difficulty: 'expert',
        pricing: 'free',
        position: { x: 1400, y: 250 },
        width: 400,
        height: 200,
        isMainTechnology: true,
        isContainer: true,
        containerType: 'kubernetes',
        ports: ['9090', '3000'],
        resources: {
          cpu: '1 cores',
          memory: '1GB',
          storage: '50GB',
          network: '100Mbps'
        },
        compatibleWith: ['k8s-frontend-cluster', 'k8s-backend-cluster'],
      }
    ],
    connections: [
      {
        id: 'frontend-backend',
        sourceNodeId: 'k8s-frontend-cluster',
        targetNodeId: 'k8s-backend-cluster',
        type: 'compatible'
      },
      {
        id: 'backend-database',
        sourceNodeId: 'k8s-backend-cluster',
        targetNodeId: 'k8s-database-cluster',
        type: 'compatible'
      },
      {
        id: 'frontend-monitoring',
        sourceNodeId: 'k8s-frontend-cluster',
        targetNodeId: 'k8s-monitoring',
        type: 'compatible'
      },
      {
        id: 'backend-monitoring',
        sourceNodeId: 'k8s-backend-cluster',
        targetNodeId: 'k8s-monitoring',
        type: 'compatible'
      }
    ]
  },
  {
    id: 'docker-compose-fullstack',
    name: 'Docker Compose Full-Stack',
    description: 'Stack complète avec Docker Compose pour le développement local',
    category: 'devops',
    nodes: [
      {
        id: 'frontend-service',
        name: 'Frontend Service',
        category: 'frontend',
        description: 'Service React/Next.js avec Docker Compose',
        setupTimeHours: 2,
        difficulty: 'intermediate',
        pricing: 'free',
        position: { x: 100, y: 150 },
        width: 350,
        height: 180,
        isMainTechnology: true,
        isContainer: true,
        containerType: 'docker',
        ports: ['3000', '3001'],
        resources: {
          cpu: '1 cores',
          memory: '512MB',
          storage: '2GB',
          network: '100Mbps'
        },
        canAcceptSubTech: ['styling', 'testing'],
        subTechnologies: [commonTools.tailwind],
        compatibleWith: ['backend-service', 'proxy-service'],
      },
      {
        id: 'backend-service',
        name: 'Backend Service',
        category: 'backend',
        description: 'Service API avec Docker Compose',
        setupTimeHours: 3,
        difficulty: 'intermediate',
        pricing: 'free',
        position: { x: 500, y: 150 },
        width: 350,
        height: 180,
        isMainTechnology: true,
        isContainer: true,
        containerType: 'docker',
        ports: ['8000', '8001'],
        resources: {
          cpu: '1 cores',
          memory: '1GB',
          storage: '3GB',
          network: '200Mbps'
        },
        canAcceptSubTech: ['testing', 'linting'],
        subTechnologies: [commonTools.eslint, commonTools.jest],
        compatibleWith: ['frontend-service', 'database-service', 'cache-service'],
      },
      {
        id: 'database-service',
        name: 'Database Service',
        category: 'database',
        description: 'PostgreSQL avec Docker Compose et volumes persistants',
        setupTimeHours: 1,
        difficulty: 'beginner',
        pricing: 'free',
        position: { x: 900, y: 150 },
        width: 300,
        height: 150,
        isMainTechnology: true,
        isContainer: true,
        containerType: 'docker',
        ports: ['5432'],
        resources: {
          cpu: '0.5 cores',
          memory: '512MB',
          storage: '10GB',
          network: '50Mbps'
        },
        compatibleWith: ['backend-service'],
      },
      {
        id: 'cache-service',
        name: 'Cache Service',
        category: 'database',
        description: 'Redis pour le cache avec Docker Compose',
        setupTimeHours: 1,
        difficulty: 'beginner',
        pricing: 'free',
        position: { x: 700, y: 350 },
        width: 250,
        height: 120,
        isMainTechnology: true,
        isContainer: true,
        containerType: 'docker',
        ports: ['6379'],
        resources: {
          cpu: '0.2 cores',
          memory: '256MB',
          storage: '1GB',
          network: '20Mbps'
        },
        compatibleWith: ['backend-service'],
      },
      {
        id: 'proxy-service',
        name: 'Proxy Service',
        category: 'devops',
        description: 'Nginx reverse proxy avec Docker Compose',
        setupTimeHours: 1,
        difficulty: 'beginner',
        pricing: 'free',
        position: { x: 300, y: 350 },
        width: 300,
        height: 120,
        isMainTechnology: true,
        isContainer: true,
        containerType: 'docker',
        ports: ['80', '443'],
        resources: {
          cpu: '0.2 cores',
          memory: '128MB',
          storage: '500MB',
          network: '500Mbps'
        },
        compatibleWith: ['frontend-service', 'backend-service'],
      }
    ],
    connections: [
      {
        id: 'proxy-frontend',
        sourceNodeId: 'proxy-service',
        targetNodeId: 'frontend-service',
        type: 'compatible'
      },
      {
        id: 'proxy-backend',
        sourceNodeId: 'proxy-service',
        targetNodeId: 'backend-service',
        type: 'compatible'
      },
      {
        id: 'frontend-backend',
        sourceNodeId: 'frontend-service',
        targetNodeId: 'backend-service',
        type: 'compatible'
      },
      {
        id: 'backend-database',
        sourceNodeId: 'backend-service',
        targetNodeId: 'database-service',
        type: 'compatible'
      },
      {
        id: 'backend-cache',
        sourceNodeId: 'backend-service',
        targetNodeId: 'cache-service',
        type: 'compatible'
      }
    ]
  },
  {
    id: 'simple-docker-stack',
    name: 'Docker Stack Simple',
    description: 'Stack Docker simple avec frontend React et API Node.js',
    category: 'devops',
    nodes: [
      {
        id: 'react-app',
        name: 'React Frontend',
        category: 'frontend',
        description: 'Application React moderne avec Tailwind CSS',
        setupTimeHours: 2,
        difficulty: 'intermediate',
        pricing: 'free',
        position: { x: 100, y: 200 },
        width: 280,
        height: 160,
        isMainTechnology: true,
        canAcceptSubTech: ['styling', 'testing'],
        subTechnologies: [commonTools.tailwind, commonTools.jest],
        resources: {
          cpu: '0.5 cores',
          memory: '512MB',
          storage: '1GB',
          network: '50Mbps'
        },
        compatibleWith: ['nodejs-api', 'postgres-db'],
      },
      {
        id: 'nodejs-api',
        name: 'Node.js API',
        category: 'backend',
        description: 'API REST avec Express.js et validation',
        setupTimeHours: 3,
        difficulty: 'intermediate',
        pricing: 'free',
        position: { x: 450, y: 200 },
        width: 280,
        height: 160,
        isMainTechnology: true,
        canAcceptSubTech: ['testing', 'linting'],
        subTechnologies: [commonTools.eslint, commonTools.jest],
        resources: {
          cpu: '1 cores',
          memory: '1GB',
          storage: '2GB',
          network: '100Mbps'
        },
        compatibleWith: ['react-app', 'postgres-db'],
      },
      {
        id: 'postgres-db',
        name: 'PostgreSQL',
        category: 'database',
        description: 'Base de données PostgreSQL avec données persistantes',
        setupTimeHours: 1,
        difficulty: 'beginner',
        pricing: 'free',
        position: { x: 800, y: 200 },
        width: 250,
        height: 140,
        isMainTechnology: true,
        resources: {
          cpu: '0.5 cores',
          memory: '512MB',
          storage: '10GB',
          network: '25Mbps'
        },
        compatibleWith: ['nodejs-api'],
      }
    ],
    connections: [
      {
        id: 'react-api',
        sourceNodeId: 'react-app',
        targetNodeId: 'nodejs-api',
        type: 'compatible'
      },
      {
        id: 'api-db',
        sourceNodeId: 'nodejs-api',
        targetNodeId: 'postgres-db',
        type: 'compatible'
      }
    ]
  }
];