import type { Meta, StoryObj } from '@storybook/react';
import { Header, Navigation } from '@/components/ui/Header';
import { Home, Stack, Plus, Settings, User, FileText, Shield } from 'lucide-react';

const meta: Meta<typeof Header> = {
  title: 'UI/Header & Navigation',
  component: Header,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DefaultHeader: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-slate-900">
        <Story />
        <div className="p-8 max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-100 mb-4">Page Content</h1>
          <p className="text-slate-300">
            The header is sticky and will stay at the top when scrolling. 
            It includes navigation, search, notifications, and user menu.
          </p>
        </div>
      </div>
    ),
  ],
};

export const HorizontalNavigation: Story = {
  render: () => {
    const items = [
      { name: 'Home', href: '/', icon: Home },
      { name: 'Stacks', href: '/stacks', icon: Stack, badge: 'New' },
      { name: 'Builder', href: '/builder', icon: Plus },
      { name: 'Documentation', href: '/docs', icon: FileText },
      { name: 'Settings', href: '/settings', icon: Settings, badge: 3 },
    ];

    return (
      <div className="p-8 bg-slate-900">
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-4">Horizontal Navigation</h3>
            <Navigation items={items} orientation="horizontal" />
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-4">With Custom Styling</h3>
            <Navigation 
              items={items} 
              orientation="horizontal" 
              className="bg-slate-800/50 p-2 rounded-lg"
            />
          </div>
        </div>
      </div>
    );
  },
};

export const VerticalNavigation: Story = {
  render: () => {
    const items = [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'My Stacks', href: '/my-stacks', icon: Stack, badge: 5 },
      { name: 'Create New', href: '/create', icon: Plus },
      { name: 'Profile', href: '/profile', icon: User },
      { name: 'Security', href: '/security', icon: Shield },
      { name: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
      <div className="p-8 bg-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-4">Vertical Navigation</h3>
            <Navigation items={items} orientation="vertical" />
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-4">In a Sidebar</h3>
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <Navigation items={items} orientation="vertical" />
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-4">Compact Version</h3>
            <div className="bg-slate-800/50 p-2 rounded-lg inline-block">
              <Navigation 
                items={items.map(item => ({ ...item, name: '' }))} 
                orientation="vertical" 
              />
            </div>
          </div>
        </div>
      </div>
    );
  },
};

export const CompleteLayout: Story = {
  render: () => {
    const sidebarItems = [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'My Stacks', href: '/my-stacks', icon: Stack, badge: 5 },
      { name: 'Favorites', href: '/favorites', icon: User },
      { name: 'Settings', href: '/settings', icon: Settings },
    ];

    return (
      <div className="min-h-screen bg-slate-900">
        <Header />
        <div className="flex">
          <aside className="w-64 min-h-[calc(100vh-4rem)] bg-slate-800/30 border-r border-slate-800 p-4">
            <Navigation items={sidebarItems} orientation="vertical" />
          </aside>
          <main className="flex-1 p-8">
            <h1 className="text-3xl font-bold text-slate-100 mb-4">Dashboard</h1>
            <p className="text-slate-300 mb-8">
              This demonstrates a complete layout with header and sidebar navigation.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800/50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-100 mb-2">Total Stacks</h3>
                <p className="text-3xl font-bold text-blue-400">24</p>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-100 mb-2">Technologies</h3>
                <p className="text-3xl font-bold text-green-400">156</p>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-slate-100 mb-2">Contributors</h3>
                <p className="text-3xl font-bold text-purple-400">89</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export const MobileView: Story = {
  render: () => (
    <div className="min-h-screen bg-slate-900">
      <Header />
      <div className="p-4">
        <h1 className="text-2xl font-bold text-slate-100 mb-4">Mobile View</h1>
        <p className="text-slate-300">
          Resize your browser to see the mobile menu. The navigation collapses into a hamburger menu on smaller screens.
        </p>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};