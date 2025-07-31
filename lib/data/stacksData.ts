export interface StackData {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  setupTimeHours: number;
  pricing: 'free' | 'freemium' | 'paid' | 'mixed';
  technologies: {
    id: string;
    name: string;
    category: 'frontend' | 'backend' | 'database' | 'devops' | 'mobile' | 'ai' | 'other';
    role: 'primary' | 'secondary' | 'optional';
  }[];
  useCases: string[];
  pros: string[];
  cons: string[];
  alternatives: string[];
  installationSteps: string[];
  stars: number;
  uses: number;
  author: string;
  createdAt: string;
}

export const officialStacks: StackData[] = [
  {
    id: 'modern-saas',
    name: 'Modern SaaS Stack',
    description: 'Complete full-stack solution for building scalable SaaS applications with modern technologies. Perfect for startups and enterprises looking to build production-ready applications.',
    shortDescription: 'Next.js + Supabase + Stripe for SaaS',
    category: 'Full-stack',
    difficulty: 'intermediate',
    setupTimeHours: 6,
    pricing: 'freemium',
    technologies: [
      { id: 'nextjs', name: 'Next.js', category: 'frontend', role: 'primary' },
      { id: 'typescript', name: 'TypeScript', category: 'frontend', role: 'primary' },
      { id: 'supabase', name: 'Supabase', category: 'backend', role: 'primary' },
      { id: 'stripe', name: 'Stripe', category: 'other', role: 'primary' },
      { id: 'tailwind', name: 'Tailwind CSS', category: 'frontend', role: 'secondary' },
      { id: 'vercel', name: 'Vercel', category: 'devops', role: 'secondary' },
    ],
    useCases: ['SaaS Applications', 'Subscription Services', 'B2B Tools', 'Marketplaces'],
    pros: [
      'Integrated authentication and database',
      'Built-in payment processing',
      'Excellent developer experience',
      'Fast deployment with Vercel'
    ],
    cons: [
      'Vendor lock-in with Supabase',
      'Limited customization for complex auth',
      'Stripe fees for payments'
    ],
    alternatives: ['MERN Stack', 'T3 Stack', 'Laravel + Vue'],
    installationSteps: [
      'Create Next.js project with TypeScript',
      'Set up Supabase project and configure auth',
      'Install and configure Stripe',
      'Set up Tailwind CSS',
      'Deploy to Vercel'
    ],
    stars: 4.8,
    uses: 2847,
    author: 'BlueKit Team',
    createdAt: '2024-01-15',
  },
  {
    id: 'ai-powered-app',
    name: 'AI-Powered Application',
    description: 'Build intelligent applications with modern AI tools and frameworks. Includes real-time capabilities and vector database for AI features.',
    shortDescription: 'React + FastAPI + OpenAI for AI apps',
    category: 'AI/ML',
    difficulty: 'expert',
    setupTimeHours: 12,
    pricing: 'paid',
    technologies: [
      { id: 'react', name: 'React', category: 'frontend', role: 'primary' },
      { id: 'fastapi', name: 'FastAPI', category: 'backend', role: 'primary' },
      { id: 'openai', name: 'OpenAI API', category: 'ai', role: 'primary' },
      { id: 'postgresql', name: 'PostgreSQL', category: 'database', role: 'primary' },
      { id: 'redis', name: 'Redis', category: 'database', role: 'secondary' },
      { id: 'docker', name: 'Docker', category: 'devops', role: 'secondary' },
      { id: 'pinecone', name: 'Pinecone', category: 'database', role: 'optional' },
    ],
    useCases: ['AI Chatbots', 'Content Generation', 'Data Analysis', 'ML Applications'],
    pros: [
      'High-performance backend with FastAPI',
      'Powerful AI capabilities',
      'Scalable architecture',
      'Real-time features'
    ],
    cons: [
      'High complexity',
      'Expensive AI API costs',
      'Requires ML knowledge',
      'Resource intensive'
    ],
    alternatives: ['Django + React', 'Node.js + OpenAI', 'Python + Streamlit'],
    installationSteps: [
      'Set up React frontend',
      'Create FastAPI backend',
      'Configure OpenAI API',
      'Set up PostgreSQL database',
      'Implement Redis for caching',
      'Containerize with Docker'
    ],
    stars: 4.6,
    uses: 1234,
    author: 'AI Experts',
    createdAt: '2024-01-20',
  },
  {
    id: 'startup-mvp',
    name: 'Startup MVP Stack',
    description: 'Quick and cost-effective stack for building minimum viable products. Perfect for rapid prototyping and early-stage startups.',
    shortDescription: 'Vue.js + Firebase for rapid MVPs',
    category: 'Rapid Development',
    difficulty: 'beginner',
    setupTimeHours: 3,
    pricing: 'free',
    technologies: [
      { id: 'vuejs', name: 'Vue.js', category: 'frontend', role: 'primary' },
      { id: 'firebase', name: 'Firebase', category: 'backend', role: 'primary' },
      { id: 'tailwind', name: 'Tailwind CSS', category: 'frontend', role: 'secondary' },
      { id: 'netlify', name: 'Netlify', category: 'devops', role: 'secondary' },
    ],
    useCases: ['MVP Development', 'Prototypes', 'Landing Pages', 'Small Apps'],
    pros: [
      'Very fast setup',
      'Low cost',
      'Good for beginners',
      'Automatic scaling'
    ],
    cons: [
      'Limited backend control',
      'Firebase vendor lock-in',
      'May need migration for scale'
    ],
    alternatives: ['React + Supabase', 'Nuxt.js + Firebase', 'Svelte + Firebase'],
    installationSteps: [
      'Create Vue.js project',
      'Set up Firebase project',
      'Configure Firebase auth and database',
      'Add Tailwind CSS',
      'Deploy to Netlify'
    ],
    stars: 4.7,
    uses: 3912,
    author: 'Startup Advisors',
    createdAt: '2024-01-10',
  },
  {
    id: 'ecommerce-platform',
    name: 'E-commerce Platform',
    description: 'Complete e-commerce solution with payment processing, inventory management, and admin dashboard.',
    shortDescription: 'Next.js + Shopify + Stripe for e-commerce',
    category: 'E-commerce',
    difficulty: 'intermediate',
    setupTimeHours: 8,
    pricing: 'paid',
    technologies: [
      { id: 'nextjs', name: 'Next.js', category: 'frontend', role: 'primary' },
      { id: 'shopify', name: 'Shopify API', category: 'backend', role: 'primary' },
      { id: 'stripe', name: 'Stripe', category: 'other', role: 'primary' },
      { id: 'prisma', name: 'Prisma', category: 'database', role: 'secondary' },
      { id: 'aws', name: 'AWS', category: 'devops', role: 'secondary' },
    ],
    useCases: ['Online Stores', 'Marketplaces', 'B2C Commerce', 'Product Catalogs'],
    pros: [
      'Proven e-commerce features',
      'Secure payment processing',
      'Scalable infrastructure',
      'SEO optimized'
    ],
    cons: [
      'Shopify transaction fees',
      'Complex setup',
      'Requires e-commerce knowledge'
    ],
    alternatives: ['WooCommerce', 'Magento', 'Saleor'],
    installationSteps: [
      'Set up Next.js project',
      'Configure Shopify store and API',
      'Integrate Stripe payments',
      'Set up Prisma database',
      'Deploy to AWS'
    ],
    stars: 4.5,
    uses: 1876,
    author: 'E-commerce Experts',
    createdAt: '2024-01-25',
  },
  {
    id: 'mobile-pwa',
    name: 'Mobile-First PWA',
    description: 'Progressive Web App with native-like experience, offline capabilities, and mobile optimization.',
    shortDescription: 'React PWA + Workbox for mobile apps',
    category: 'Mobile',
    difficulty: 'intermediate',
    setupTimeHours: 5,
    pricing: 'free',
    technologies: [
      { id: 'react', name: 'React', category: 'frontend', role: 'primary' },
      { id: 'pwa', name: 'PWA', category: 'frontend', role: 'primary' },
      { id: 'workbox', name: 'Workbox', category: 'frontend', role: 'secondary' },
      { id: 'indexeddb', name: 'IndexedDB', category: 'database', role: 'secondary' },
      { id: 'netlify', name: 'Netlify', category: 'devops', role: 'optional' },
    ],
    useCases: ['Mobile Apps', 'Offline Apps', 'Cross-platform', 'Performance Critical'],
    pros: [
      'Native-like experience',
      'Offline functionality',
      'Cross-platform compatibility',
      'App store distribution'
    ],
    cons: [
      'iOS limitations',
      'Complex caching strategies',
      'Battery consumption'
    ],
    alternatives: ['React Native', 'Ionic', 'Flutter Web'],
    installationSteps: [
      'Create React app with PWA template',
      'Configure service worker',
      'Set up Workbox for caching',
      'Implement offline storage',
      'Optimize for mobile'
    ],
    stars: 4.3,
    uses: 967,
    author: 'Mobile Team',
    createdAt: '2024-01-18',
  },
  {
    id: 'realtime-collaboration',
    name: 'Real-time Collaboration',
    description: 'Build applications with real-time collaboration features like live editing, chat, and synchronization.',
    shortDescription: 'Next.js + Socket.io for real-time apps',
    category: 'Real-time',
    difficulty: 'expert',
    setupTimeHours: 10,
    pricing: 'freemium',
    technologies: [
      { id: 'nextjs', name: 'Next.js', category: 'frontend', role: 'primary' },
      { id: 'socketio', name: 'Socket.io', category: 'backend', role: 'primary' },
      { id: 'redis', name: 'Redis', category: 'database', role: 'primary' },
      { id: 'postgresql', name: 'PostgreSQL', category: 'database', role: 'secondary' },
      { id: 'kubernetes', name: 'Kubernetes', category: 'devops', role: 'optional' },
    ],
    useCases: ['Collaborative Editors', 'Live Chat', 'Gaming', 'Real-time Dashboards'],
    pros: [
      'Real-time synchronization',
      'Scalable architecture',
      'Rich interaction features',
      'WebSocket support'
    ],
    cons: [
      'Complex state management',
      'High server resources',
      'Network dependency',
      'Conflict resolution complexity'
    ],
    alternatives: ['Firebase Realtime DB', 'Ably', 'Pusher'],
    installationSteps: [
      'Set up Next.js with API routes',
      'Configure Socket.io server',
      'Set up Redis for session storage',
      'Implement real-time features',
      'Add conflict resolution',
      'Deploy with load balancing'
    ],
    stars: 4.4,
    uses: 743,
    author: 'Real-time Specialists',
    createdAt: '2024-01-22',
  },
  {
    id: 'jamstack-blog',
    name: 'JAMstack Blog',
    description: 'Modern static blog with excellent performance, SEO, and developer experience using JAMstack architecture.',
    shortDescription: 'Gatsby + Contentful + Netlify',
    category: 'Content',
    difficulty: 'beginner',
    setupTimeHours: 4,
    pricing: 'freemium',
    technologies: [
      { id: 'gatsby', name: 'Gatsby', category: 'frontend', role: 'primary' },
      { id: 'contentful', name: 'Contentful', category: 'other', role: 'primary' },
      { id: 'graphql', name: 'GraphQL', category: 'backend', role: 'secondary' },
      { id: 'netlify', name: 'Netlify', category: 'devops', role: 'secondary' },
    ],
    useCases: ['Blogs', 'Documentation', 'Marketing Sites', 'Portfolios'],
    pros: [
      'Excellent SEO',
      'Fast loading',
      'Easy content management',
      'Great developer experience'
    ],
    cons: [
      'Build time increases with content',
      'Dynamic features limited',
      'Contentful costs for scale'
    ],
    alternatives: ['Next.js + Sanity', 'Nuxt.js + Strapi', 'Hugo + Forestry'],
    installationSteps: [
      'Create Gatsby project',
      'Set up Contentful CMS',
      'Configure GraphQL queries',
      'Add blog templates',
      'Deploy to Netlify'
    ],
    stars: 4.6,
    uses: 2156,
    author: 'Content Team',
    createdAt: '2024-01-12',
  },
  {
    id: 'enterprise-dashboard',
    name: 'Enterprise Dashboard',
    description: 'Scalable enterprise dashboard with advanced analytics, role-based access, and comprehensive admin features.',
    shortDescription: 'React + Node.js + PostgreSQL',
    category: 'Enterprise',
    difficulty: 'expert',
    setupTimeHours: 15,
    pricing: 'mixed',
    technologies: [
      { id: 'react', name: 'React', category: 'frontend', role: 'primary' },
      { id: 'nodejs', name: 'Node.js', category: 'backend', role: 'primary' },
      { id: 'postgresql', name: 'PostgreSQL', category: 'database', role: 'primary' },
      { id: 'redis', name: 'Redis', category: 'database', role: 'secondary' },
      { id: 'elasticsearch', name: 'Elasticsearch', category: 'database', role: 'secondary' },
      { id: 'docker', name: 'Docker', category: 'devops', role: 'secondary' },
      { id: 'kubernetes', name: 'Kubernetes', category: 'devops', role: 'optional' },
    ],
    useCases: ['Admin Dashboards', 'Analytics Platforms', 'Business Intelligence', 'CRM Systems'],
    pros: [
      'Highly scalable',
      'Advanced security features',
      'Comprehensive analytics',
      'Enterprise-grade reliability'
    ],
    cons: [
      'Very complex setup',
      'High infrastructure costs',
      'Requires DevOps expertise',
      'Long development time'
    ],
    alternatives: ['Angular + .NET', 'Vue + Laravel', 'Django Admin'],
    installationSteps: [
      'Set up React frontend with admin components',
      'Create Node.js API with authentication',
      'Configure PostgreSQL with proper schemas',
      'Set up Redis for caching',
      'Add Elasticsearch for search',
      'Containerize with Docker',
      'Deploy with Kubernetes'
    ],
    stars: 4.2,
    uses: 456,
    author: 'Enterprise Team',
    createdAt: '2024-01-28',
  },
  {
    id: 'microservices-platform',
    name: 'Microservices Platform',
    description: 'Distributed microservices architecture with API gateway, service discovery, and monitoring.',
    shortDescription: 'Node.js + Docker + Kubernetes',
    category: 'Microservices',
    difficulty: 'expert',
    setupTimeHours: 20,
    pricing: 'mixed',
    technologies: [
      { id: 'nodejs', name: 'Node.js', category: 'backend', role: 'primary' },
      { id: 'docker', name: 'Docker', category: 'devops', role: 'primary' },
      { id: 'kubernetes', name: 'Kubernetes', category: 'devops', role: 'primary' },
      { id: 'nginx', name: 'Nginx', category: 'devops', role: 'secondary' },
      { id: 'mongodb', name: 'MongoDB', category: 'database', role: 'secondary' },
      { id: 'prometheus', name: 'Prometheus', category: 'devops', role: 'optional' },
    ],
    useCases: ['Large Scale Applications', 'Distributed Systems', 'Multi-team Development', 'High Availability'],
    pros: [
      'Highly scalable',
      'Independent deployments',
      'Technology diversity',
      'Fault isolation'
    ],
    cons: [
      'Extreme complexity',
      'Network overhead',
      'Monitoring challenges',
      'Requires DevOps expertise'
    ],
    alternatives: ['Serverless Architecture', 'Monolithic', 'Service Mesh'],
    installationSteps: [
      'Design service boundaries',
      'Create individual Node.js services',
      'Containerize services with Docker',
      'Set up Kubernetes cluster',
      'Configure API gateway',
      'Implement service discovery',
      'Add monitoring and logging'
    ],
    stars: 4.1,
    uses: 234,
    author: 'DevOps Team',
    createdAt: '2024-01-30',
  },
  {
    id: 'ml-data-pipeline',
    name: 'ML Data Pipeline',
    description: 'Complete machine learning pipeline with data processing, model training, and deployment infrastructure.',
    shortDescription: 'Python + MLflow + Kubernetes',
    category: 'Data Science',
    difficulty: 'expert',
    setupTimeHours: 18,
    pricing: 'mixed',
    technologies: [
      { id: 'python', name: 'Python', category: 'backend', role: 'primary' },
      { id: 'mlflow', name: 'MLflow', category: 'ai', role: 'primary' },
      { id: 'tensorflow', name: 'TensorFlow', category: 'ai', role: 'secondary' },
      { id: 'kubeflow', name: 'Kubeflow', category: 'devops', role: 'secondary' },
      { id: 'postgresql', name: 'PostgreSQL', category: 'database', role: 'secondary' },
      { id: 'airflow', name: 'Apache Airflow', category: 'devops', role: 'optional' },
    ],
    useCases: ['ML Model Training', 'Data Processing', 'Model Deployment', 'MLOps'],
    pros: [
      'Complete ML lifecycle',
      'Experiment tracking',
      'Scalable training',
      'Model versioning'
    ],
    cons: [
      'Steep learning curve',
      'Resource intensive',
      'Complex infrastructure',
      'Requires ML expertise'
    ],
    alternatives: ['AWS SageMaker', 'Google AI Platform', 'Azure ML'],
    installationSteps: [
      'Set up Python environment',
      'Configure MLflow tracking',
      'Set up Kubernetes cluster',
      'Install Kubeflow',
      'Create data pipeline',
      'Implement model training',
      'Set up model serving'
    ],
    stars: 4.0,
    uses: 345,
    author: 'Data Science Team',
    createdAt: '2024-02-01',
  }
];

// Add more stacks to reach 30 total
export const additionalStacks: StackData[] = [
  {
    id: 'graphql-api',
    name: 'GraphQL API Stack',
    description: 'Modern API development with GraphQL, providing flexible and efficient data fetching for any client.',
    shortDescription: 'GraphQL + Apollo + Prisma',
    category: 'API',
    difficulty: 'intermediate',
    setupTimeHours: 6,
    pricing: 'free',
    technologies: [
      { id: 'graphql', name: 'GraphQL', category: 'backend', role: 'primary' },
      { id: 'apollo', name: 'Apollo Server', category: 'backend', role: 'primary' },
      { id: 'prisma', name: 'Prisma', category: 'database', role: 'primary' },
      { id: 'typescript', name: 'TypeScript', category: 'backend', role: 'secondary' },
      { id: 'postgresql', name: 'PostgreSQL', category: 'database', role: 'secondary' },
    ],
    useCases: ['API Development', 'Data Layer', 'Microservices', 'Mobile Backends'],
    pros: ['Flexible queries', 'Strong typing', 'Great tooling', 'Single endpoint'],
    cons: ['Learning curve', 'Over-fetching possible', 'Caching complexity'],
    alternatives: ['REST API', 'tRPC', 'Hasura'],
    installationSteps: [
      'Set up Apollo Server',
      'Define GraphQL schema',
      'Configure Prisma',
      'Connect to PostgreSQL',
      'Add resolvers'
    ],
    stars: 4.4,
    uses: 1456,
    author: 'API Team',
    createdAt: '2024-02-05',
  },
  {
    id: 'serverless-stack',
    name: 'Serverless Stack',
    description: 'Build scalable applications without managing servers using AWS Lambda, API Gateway, and DynamoDB.',
    shortDescription: 'AWS Lambda + API Gateway + DynamoDB',
    category: 'Serverless',
    difficulty: 'intermediate',
    setupTimeHours: 4,
    pricing: 'freemium',
    technologies: [
      { id: 'lambda', name: 'AWS Lambda', category: 'backend', role: 'primary' },
      { id: 'apigateway', name: 'API Gateway', category: 'backend', role: 'primary' },
      { id: 'dynamodb', name: 'DynamoDB', category: 'database', role: 'primary' },
      { id: 'cloudformation', name: 'CloudFormation', category: 'devops', role: 'secondary' },
      { id: 'sam', name: 'AWS SAM', category: 'devops', role: 'optional' },
    ],
    useCases: ['Microservices', 'Event Processing', 'API Backends', 'Batch Jobs'],
    pros: ['Auto-scaling', 'Pay per use', 'No server management', 'Fast deployment'],
    cons: ['Cold starts', 'Vendor lock-in', 'Debugging complexity', 'Time limits'],
    alternatives: ['Traditional servers', 'Containers', 'Vercel Functions'],
    installationSteps: [
      'Configure AWS CLI',
      'Create Lambda functions',
      'Set up API Gateway',
      'Configure DynamoDB',
      'Deploy with SAM/CloudFormation'
    ],
    stars: 4.2,
    uses: 987,
    author: 'Cloud Team',
    createdAt: '2024-02-08',
  },
  {
    id: 'electron-desktop',
    name: 'Electron Desktop App',
    description: 'Cross-platform desktop application development using web technologies with native OS integration.',
    shortDescription: 'Electron + React + Node.js',
    category: 'Desktop',
    difficulty: 'intermediate',
    setupTimeHours: 7,
    pricing: 'free',
    technologies: [
      { id: 'electron', name: 'Electron', category: 'desktop', role: 'primary' },
      { id: 'react', name: 'React', category: 'frontend', role: 'primary' },
      { id: 'nodejs', name: 'Node.js', category: 'backend', role: 'primary' },
      { id: 'webpack', name: 'Webpack', category: 'devops', role: 'secondary' },
      { id: 'electronbuilder', name: 'Electron Builder', category: 'devops', role: 'secondary' },
    ],
    useCases: ['Desktop Apps', 'Cross-platform Tools', 'Native Integration', 'Offline Apps'],
    pros: ['Cross-platform', 'Web tech skills', 'Rich ecosystem', 'Native APIs'],
    cons: ['Large bundle size', 'Memory usage', 'Performance overhead'],
    alternatives: ['Tauri', 'Flutter Desktop', 'Native development'],
    installationSteps: [
      'Initialize Electron project',
      'Set up React frontend',
      'Configure main process',
      'Add native integrations',
      'Set up build pipeline'
    ],
    stars: 4.1,
    uses: 654,
    author: 'Desktop Team',
    createdAt: '2024-02-10',
  },
  {
    id: 'iot-platform',
    name: 'IoT Platform',
    description: 'Internet of Things platform for collecting, processing, and visualizing sensor data at scale.',
    shortDescription: 'MQTT + InfluxDB + Grafana',
    category: 'IoT',
    difficulty: 'expert',
    setupTimeHours: 16,
    pricing: 'mixed',
    technologies: [
      { id: 'mqtt', name: 'MQTT Broker', category: 'backend', role: 'primary' },
      { id: 'influxdb', name: 'InfluxDB', category: 'database', role: 'primary' },
      { id: 'grafana', name: 'Grafana', category: 'frontend', role: 'primary' },
      { id: 'nodejs', name: 'Node.js', category: 'backend', role: 'secondary' },
      { id: 'redis', name: 'Redis', category: 'database', role: 'secondary' },
      { id: 'docker', name: 'Docker', category: 'devops', role: 'optional' },
    ],
    useCases: ['Sensor Networks', 'Industrial Monitoring', 'Smart Cities', 'Home Automation'],
    pros: ['Real-time processing', 'Time-series optimization', 'Scalable ingestion', 'Rich visualization'],
    cons: ['Complex setup', 'High resource usage', 'Network dependencies'],
    alternatives: ['AWS IoT', 'Google Cloud IoT', 'Azure IoT'],
    installationSteps: [
      'Set up MQTT broker',
      'Configure InfluxDB',
      'Install Grafana',
      'Create data pipeline',
      'Set up monitoring',
      'Configure alerts'
    ],
    stars: 4.0,
    uses: 312,
    author: 'IoT Specialists',
    createdAt: '2024-02-12',
  },
  {
    id: 'blockchain-dapp',
    name: 'Blockchain DApp',
    description: 'Decentralized application development with smart contracts and Web3 integration.',
    shortDescription: 'Ethereum + Solidity + Web3.js',
    category: 'Blockchain',
    difficulty: 'expert',
    setupTimeHours: 14,
    pricing: 'mixed',
    technologies: [
      { id: 'ethereum', name: 'Ethereum', category: 'blockchain', role: 'primary' },
      { id: 'solidity', name: 'Solidity', category: 'backend', role: 'primary' },
      { id: 'web3js', name: 'Web3.js', category: 'frontend', role: 'primary' },
      { id: 'hardhat', name: 'Hardhat', category: 'devops', role: 'secondary' },
      { id: 'metamask', name: 'MetaMask', category: 'other', role: 'secondary' },
      { id: 'ipfs', name: 'IPFS', category: 'other', role: 'optional' },
    ],
    useCases: ['DeFi Apps', 'NFT Marketplaces', 'DAOs', 'Token Systems'],
    pros: ['Decentralized', 'Transparent', 'Global access', 'Programmable money'],
    cons: ['High gas fees', 'Complexity', 'Scalability issues', 'User experience'],
    alternatives: ['Polygon', 'Solana', 'Binance Smart Chain'],
    installationSteps: [
      'Set up development environment',
      'Write smart contracts',
      'Deploy to testnet',
      'Build frontend interface',
      'Integrate Web3 wallet',
      'Test thoroughly',
      'Deploy to mainnet'
    ],
    stars: 3.9,
    uses: 289,
    author: 'Blockchain Team',
    createdAt: '2024-02-15',
  },
  // Continue with 15 more stacks...
];

export const getAllStacks = (): StackData[] => {
  return [...officialStacks, ...additionalStacks];
};

export const getStackById = (id: string): StackData | undefined => {
  return getAllStacks().find(stack => stack.id === id);
};

export const getStacksByCategory = (category: string): StackData[] => {
  return getAllStacks().filter(stack => stack.category === category);
};

export const getStacksByDifficulty = (difficulty: string): StackData[] => {
  return getAllStacks().filter(stack => stack.difficulty === difficulty);
};