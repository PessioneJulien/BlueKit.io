import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Code2, Zap, Shield } from 'lucide-react';

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
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
      options: ['default', 'glass', 'solid'],
      description: 'Visual style variant of the card',
    },
    noPadding: {
      control: 'boolean',
      description: 'Remove default padding',
    },
    hover: {
      control: 'boolean',
      description: 'Enable hover effects',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <CardHeader>
          <CardTitle>Default Card</CardTitle>
          <CardDescription>This is a default card with standard styling</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
            incididunt ut labore et dolore magna aliqua.
          </p>
        </CardContent>
      </>
    ),
  },
};

export const Glassmorphism: Story = {
  args: {
    variant: 'glass',
    children: (
      <>
        <CardHeader>
          <CardTitle>Glassmorphism Card</CardTitle>
          <CardDescription>Beautiful glass effect with backdrop blur</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300">
            This card uses a glassmorphism effect with transparency and backdrop blur, 
            perfect for modern UI designs.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="primary" size="sm">Learn More</Button>
        </CardFooter>
      </>
    ),
  },
};

export const Solid: Story = {
  args: {
    variant: 'solid',
    children: (
      <>
        <CardHeader>
          <CardTitle>Solid Card</CardTitle>
          <CardDescription>Opaque background for better contrast</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300">
            This solid variant provides maximum contrast and readability.
          </p>
        </CardContent>
      </>
    ),
  },
};

export const WithIcons: Story = {
  args: {
    variant: 'glass',
    children: (
      <>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Code2 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <CardTitle>Feature Card</CardTitle>
              <CardDescription>Cards can include icons and custom layouts</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-yellow-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-slate-200">Lightning Fast</h4>
                <p className="text-sm text-slate-400">Optimized for performance</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-slate-200">Secure by Default</h4>
                <p className="text-sm text-slate-400">Built with security in mind</p>
              </div>
            </div>
          </div>
        </CardContent>
      </>
    ),
  },
};

export const NoHover: Story = {
  args: {
    variant: 'glass',
    hover: false,
    children: (
      <>
        <CardHeader>
          <CardTitle>Static Card</CardTitle>
          <CardDescription>This card has no hover effects</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300">
            Hover effects are disabled on this card for a more static appearance.
          </p>
        </CardContent>
      </>
    ),
  },
};

export const CustomPadding: Story = {
  args: {
    variant: 'glass',
    noPadding: true,
    children: (
      <div>
        <div className="p-6 pb-4">
          <CardTitle>Custom Padding Card</CardTitle>
          <CardDescription>This card uses custom padding</CardDescription>
        </div>
        <div className="px-6 pb-6">
          <p className="text-slate-300">
            The noPadding prop allows you to control padding manually.
          </p>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-b-xl">
          <p className="text-sm text-slate-400">Custom footer section</p>
        </div>
      </div>
    ),
  },
};

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      <Card variant="glass">
        <CardHeader>
          <CardTitle as="h4">Card 1</CardTitle>
          <CardDescription>First card in grid</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300">Content for the first card.</p>
        </CardContent>
      </Card>
      <Card variant="glass">
        <CardHeader>
          <CardTitle as="h4">Card 2</CardTitle>
          <CardDescription>Second card in grid</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300">Content for the second card.</p>
        </CardContent>
      </Card>
      <Card variant="glass">
        <CardHeader>
          <CardTitle as="h4">Card 3</CardTitle>
          <CardDescription>Third card in grid</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300">Content for the third card.</p>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};