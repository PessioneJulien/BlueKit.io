import type { Meta, StoryObj } from '@storybook/react';
import { Badge, BadgeGroup } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Check, X, AlertCircle, Zap, Code2, Database, Cloud, Lock } from 'lucide-react';

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info'],
      description: 'Color variant of the badge',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the badge',
    },
    outline: {
      control: 'boolean',
      description: 'Use outline style instead of filled',
    },
    pill: {
      control: 'boolean',
      description: 'Use pill shape (fully rounded)',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default Badge',
    variant: 'default',
  },
};

export const AllVariants: Story = {
  render: () => (
    <BadgeGroup gap="md">
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="info">Info</Badge>
    </BadgeGroup>
  ),
};

export const OutlineVariants: Story = {
  render: () => (
    <BadgeGroup gap="md">
      <Badge variant="default" outline>Default</Badge>
      <Badge variant="primary" outline>Primary</Badge>
      <Badge variant="secondary" outline>Secondary</Badge>
      <Badge variant="success" outline>Success</Badge>
      <Badge variant="warning" outline>Warning</Badge>
      <Badge variant="danger" outline>Danger</Badge>
      <Badge variant="info" outline>Info</Badge>
    </BadgeGroup>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <BadgeGroup gap="md">
        <Badge size="sm" variant="primary">Small</Badge>
        <Badge size="md" variant="primary">Medium</Badge>
        <Badge size="lg" variant="primary">Large</Badge>
      </BadgeGroup>
      <BadgeGroup gap="md">
        <Badge size="sm" variant="primary" pill>Small Pill</Badge>
        <Badge size="md" variant="primary" pill>Medium Pill</Badge>
        <Badge size="lg" variant="primary" pill>Large Pill</Badge>
      </BadgeGroup>
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <BadgeGroup gap="md">
      <Badge variant="success">
        <Check className="w-3 h-3 mr-1" />
        Active
      </Badge>
      <Badge variant="danger">
        <X className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
      <Badge variant="warning">
        <AlertCircle className="w-3 h-3 mr-1" />
        Pending
      </Badge>
      <Badge variant="info">
        <Zap className="w-3 h-3 mr-1" />
        Beta
      </Badge>
    </BadgeGroup>
  ),
};

export const TechnologyBadges: Story = {
  render: () => (
    <Card variant="glass" className="w-96">
      <CardHeader>
        <CardTitle>Technology Stack</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-slate-400 mb-2">Frontend</p>
            <BadgeGroup>
              <Badge variant="primary" pill>
                <Code2 className="w-3 h-3 mr-1" />
                React
              </Badge>
              <Badge variant="primary" pill>TypeScript</Badge>
              <Badge variant="primary" pill>Tailwind CSS</Badge>
            </BadgeGroup>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-2">Backend</p>
            <BadgeGroup>
              <Badge variant="secondary" pill>
                <Database className="w-3 h-3 mr-1" />
                PostgreSQL
              </Badge>
              <Badge variant="secondary" pill>Node.js</Badge>
              <Badge variant="secondary" pill>Prisma</Badge>
            </BadgeGroup>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-2">Infrastructure</p>
            <BadgeGroup>
              <Badge variant="info" pill>
                <Cloud className="w-3 h-3 mr-1" />
                Vercel
              </Badge>
              <Badge variant="info" pill>
                <Lock className="w-3 h-3 mr-1" />
                Supabase
              </Badge>
            </BadgeGroup>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
};

export const StatusBadges: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-slate-300">Production</span>
        <Badge variant="success" size="sm">
          <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse" />
          Live
        </Badge>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-slate-300">Development</span>
        <Badge variant="warning" size="sm">
          <span className="w-2 h-2 bg-yellow-400 rounded-full mr-1.5" />
          In Progress
        </Badge>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-slate-300">Maintenance</span>
        <Badge variant="danger" size="sm">
          <span className="w-2 h-2 bg-red-400 rounded-full mr-1.5" />
          Down
        </Badge>
      </div>
    </div>
  ),
};

export const PricingBadges: Story = {
  render: () => (
    <BadgeGroup gap="lg">
      <Badge variant="success" outline>Free</Badge>
      <Badge variant="warning" outline>Freemium</Badge>
      <Badge variant="info" outline>Free Trial</Badge>
      <Badge variant="danger" outline>Paid</Badge>
      <Badge variant="secondary" outline>Enterprise</Badge>
    </BadgeGroup>
  ),
};

export const DifficultyLevels: Story = {
  render: () => (
    <div className="space-y-4">
      <Card variant="glass" className="w-80">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300">React</span>
            <Badge variant="success" size="sm">Beginner</Badge>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300">Next.js</span>
            <Badge variant="warning" size="sm">Intermediate</Badge>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300">Kubernetes</span>
            <Badge variant="danger" size="sm">Expert</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
};