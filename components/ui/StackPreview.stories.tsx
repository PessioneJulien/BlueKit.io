import type { Meta, StoryObj } from '@storybook/react';
import { StackPreview } from './StackPreview';

const meta = {
  title: 'UI/StackPreview',
  component: StackPreview,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0f172a' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div className="p-8 min-h-screen bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <Story />
        </div>
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof StackPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

const modernSaasTechnologies = [
  { id: 'nextjs', name: 'Next.js', category: 'frontend' as const, role: 'primary' as const },
  { id: 'typescript', name: 'TypeScript', category: 'frontend' as const, role: 'primary' as const },
  { id: 'supabase', name: 'Supabase', category: 'backend' as const, role: 'primary' as const },
  { id: 'stripe', name: 'Stripe', category: 'other' as const, role: 'primary' as const },
  { id: 'tailwind', name: 'Tailwind CSS', category: 'frontend' as const, role: 'secondary' as const },
  { id: 'vercel', name: 'Vercel', category: 'devops' as const, role: 'secondary' as const },
  { id: 'jest', name: 'Jest', category: 'other' as const, role: 'optional' as const },
  { id: 'storybook', name: 'Storybook', category: 'frontend' as const, role: 'optional' as const },
];

const microservicesTechnologies = [
  { id: 'nodejs', name: 'Node.js', category: 'backend' as const, role: 'primary' as const },
  { id: 'express', name: 'Express', category: 'backend' as const, role: 'primary' as const },
  { id: 'postgresql', name: 'PostgreSQL', category: 'database' as const, role: 'primary' as const },
  { id: 'redis', name: 'Redis', category: 'database' as const, role: 'primary' as const },
  { id: 'docker', name: 'Docker', category: 'devops' as const, role: 'secondary' as const },
  { id: 'kubernetes', name: 'Kubernetes', category: 'devops' as const, role: 'secondary' as const },
  { id: 'nginx', name: 'Nginx', category: 'devops' as const, role: 'secondary' as const },
  { id: 'prometheus', name: 'Prometheus', category: 'devops' as const, role: 'optional' as const },
  { id: 'grafana', name: 'Grafana', category: 'devops' as const, role: 'optional' as const },
];

const aiMLTechnologies = [
  { id: 'python', name: 'Python', category: 'ai' as const, role: 'primary' as const },
  { id: 'tensorflow', name: 'TensorFlow', category: 'ai' as const, role: 'primary' as const },
  { id: 'pytorch', name: 'PyTorch', category: 'ai' as const, role: 'primary' as const },
  { id: 'fastapi', name: 'FastAPI', category: 'backend' as const, role: 'secondary' as const },
  { id: 'jupyter', name: 'Jupyter', category: 'ai' as const, role: 'secondary' as const },
  { id: 'mlflow', name: 'MLflow', category: 'ai' as const, role: 'optional' as const },
];

const enterpriseFullStackTechnologies = [
  // Frontend Layer
  { id: 'react', name: 'React', category: 'frontend' as const, role: 'primary' as const },
  { id: 'nextjs', name: 'Next.js', category: 'frontend' as const, role: 'primary' as const },
  { id: 'typescript', name: 'TypeScript', category: 'frontend' as const, role: 'primary' as const },
  
  // Backend Layer
  { id: 'nodejs', name: 'Node.js', category: 'backend' as const, role: 'primary' as const },
  { id: 'graphql', name: 'GraphQL', category: 'backend' as const, role: 'primary' as const },
  { id: 'express', name: 'Express', category: 'backend' as const, role: 'secondary' as const },
  
  // Database Layer
  { id: 'postgresql', name: 'PostgreSQL', category: 'database' as const, role: 'primary' as const },
  { id: 'redis', name: 'Redis', category: 'database' as const, role: 'primary' as const },
  { id: 'elasticsearch', name: 'ElasticSearch', category: 'database' as const, role: 'secondary' as const },
  
  // DevOps Layer
  { id: 'docker', name: 'Docker', category: 'devops' as const, role: 'primary' as const },
  { id: 'kubernetes', name: 'Kubernetes', category: 'devops' as const, role: 'primary' as const },
  { id: 'nginx', name: 'Nginx', category: 'devops' as const, role: 'secondary' as const },
  { id: 'terraform', name: 'Terraform', category: 'devops' as const, role: 'secondary' as const },
  
  // Additional tools
  { id: 'jest', name: 'Jest', category: 'other' as const, role: 'optional' as const },
  { id: 'github-actions', name: 'GitHub Actions', category: 'devops' as const, role: 'optional' as const },
  { id: 'sentry', name: 'Sentry', category: 'other' as const, role: 'optional' as const },
];

export const ModernSaaS: Story = {
  args: {
    technologies: modernSaasTechnologies,
  },
};

export const Compact: Story = {
  args: {
    technologies: modernSaasTechnologies,
    compact: true,
  },
};

export const Microservices: Story = {
  args: {
    technologies: microservicesTechnologies,
  },
};

export const AIML: Story = {
  args: {
    technologies: aiMLTechnologies,
  },
};

export const EnterpriseFullStack: Story = {
  args: {
    technologies: enterpriseFullStackTechnologies,
  },
};

export const OnlyPrimary: Story = {
  args: {
    technologies: [
      { id: 'react', name: 'React', category: 'frontend' as const, role: 'primary' as const },
      { id: 'nodejs', name: 'Node.js', category: 'backend' as const, role: 'primary' as const },
      { id: 'mongodb', name: 'MongoDB', category: 'database' as const, role: 'primary' as const },
    ],
  },
};

export const WithAllRoles: Story = {
  args: {
    technologies: [
      // Primary
      { id: 'react', name: 'React', category: 'frontend' as const, role: 'primary' as const },
      { id: 'nodejs', name: 'Node.js', category: 'backend' as const, role: 'primary' as const },
      
      // Secondary
      { id: 'tailwind', name: 'Tailwind', category: 'frontend' as const, role: 'secondary' as const },
      { id: 'express', name: 'Express', category: 'backend' as const, role: 'secondary' as const },
      
      // Optional
      { id: 'jest', name: 'Jest', category: 'other' as const, role: 'optional' as const },
      { id: 'eslint', name: 'ESLint', category: 'other' as const, role: 'optional' as const },
      { id: 'prettier', name: 'Prettier', category: 'other' as const, role: 'optional' as const },
    ],
  },
};