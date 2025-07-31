import { NodeData, SubTechnology } from '@/components/ui/VisualBuilder/CanvasNode';

export interface StackTemplate {
  id: string;
  name: string;
  description: string;
  category: 'fullstack' | 'frontend' | 'backend' | 'mobile' | 'ai';
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
  }
];