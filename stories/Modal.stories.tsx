import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Drawer, DrawerHeader, DrawerTitle, DrawerDescription, DrawerBody, DrawerFooter } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Info, Settings, Plus, Code2, Database, Cloud } from 'lucide-react';

const meta: Meta = {
  title: 'UI/Modal & Drawer',
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
};

export default meta;

export const BasicModal: StoryObj = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <>
        <Button variant="primary" onClick={() => setIsOpen(true)}>
          Open Modal
        </Button>
        
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <ModalHeader>
            <ModalTitle>Basic Modal</ModalTitle>
            <ModalDescription>
              This is a basic modal with glassmorphism effect
            </ModalDescription>
          </ModalHeader>
          <ModalBody>
            <p className="text-slate-300">
              Modal content goes here. You can add any content you want inside the modal body.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsOpen(false)}>
              Confirm
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};

export const ModalSizes: StoryObj = {
  render: () => {
    const [openModal, setOpenModal] = useState<string | null>(null);
    const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const;
    
    return (
      <div className="flex gap-3 flex-wrap">
        {sizes.map((size) => (
          <Button
            key={size}
            variant="secondary"
            onClick={() => setOpenModal(size)}
          >
            Open {size} Modal
          </Button>
        ))}
        
        {sizes.map((size) => (
          <Modal
            key={size}
            isOpen={openModal === size}
            onClose={() => setOpenModal(null)}
            size={size}
          >
            <ModalHeader>
              <ModalTitle>{size.toUpperCase()} Modal</ModalTitle>
              <ModalDescription>
                This is a {size} sized modal
              </ModalDescription>
            </ModalHeader>
            <ModalBody>
              <p className="text-slate-300">
                Modal size: {size}. Notice how the width changes based on the size prop.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button variant="primary" onClick={() => setOpenModal(null)}>
                Close
              </Button>
            </ModalFooter>
          </Modal>
        ))}
      </div>
    );
  },
};

export const FormModal: StoryObj = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [stackName, setStackName] = useState('');
    const [category, setCategory] = useState('');
    
    const categories = [
      { value: 'web', label: 'Web Development' },
      { value: 'mobile', label: 'Mobile Development' },
      { value: 'desktop', label: 'Desktop Application' },
      { value: 'api', label: 'API/Backend Only' },
    ];
    
    return (
      <>
        <Button variant="primary" onClick={() => setIsOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Stack
        </Button>
        
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="lg">
          <ModalHeader>
            <ModalTitle>Create New Stack</ModalTitle>
            <ModalDescription>
              Build your custom technology stack
            </ModalDescription>
          </ModalHeader>
          <ModalBody>
            <form className="space-y-4">
              <Input
                label="Stack Name"
                placeholder="My Awesome Stack"
                value={stackName}
                onChange={(e) => setStackName(e.target.value)}
              />
              
              <Select
                label="Category"
                options={categories}
                value={category}
                onChange={setCategory}
                placeholder="Select a category"
              />
              
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-3">
                  Technologies
                </label>
                <div className="space-y-3">
                  <Card variant="glass" className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Code2 className="w-5 h-5 text-blue-400" />
                        <span className="text-slate-200">Frontend</span>
                      </div>
                      <Button variant="ghost" size="sm">Add Technology</Button>
                    </div>
                  </Card>
                  <Card variant="glass" className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 text-green-400" />
                        <span className="text-slate-200">Backend</span>
                      </div>
                      <Button variant="ghost" size="sm">Add Technology</Button>
                    </div>
                  </Card>
                  <Card variant="glass" className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Cloud className="w-5 h-5 text-purple-400" />
                        <span className="text-slate-200">Infrastructure</span>
                      </div>
                      <Button variant="ghost" size="sm">Add Technology</Button>
                    </div>
                  </Card>
                </div>
              </div>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsOpen(false)}>
              Create Stack
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};

export const BasicDrawer: StoryObj = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <>
        <Button variant="primary" onClick={() => setIsOpen(true)}>
          Open Drawer
        </Button>
        
        <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <DrawerHeader>
            <DrawerTitle>Settings</DrawerTitle>
            <DrawerDescription>
              Manage your application settings
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-slate-200 mb-3">Appearance</h3>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-300">Dark Mode</span>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-300">Compact View</span>
                    <input type="checkbox" className="toggle" />
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-200 mb-3">Notifications</h3>
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-300">Email Notifications</span>
                    <input type="checkbox" defaultChecked className="toggle" />
                  </label>
                  <label className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <span className="text-slate-300">Push Notifications</span>
                    <input type="checkbox" className="toggle" />
                  </label>
                </div>
              </div>
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsOpen(false)}>
              Save Changes
            </Button>
          </DrawerFooter>
        </Drawer>
      </>
    );
  },
};

export const DrawerPositions: StoryObj = {
  render: () => {
    const [openDrawer, setOpenDrawer] = useState<string | null>(null);
    const positions = ['left', 'right', 'top', 'bottom'] as const;
    
    return (
      <div className="flex gap-3 flex-wrap">
        {positions.map((position) => (
          <Button
            key={position}
            variant="secondary"
            onClick={() => setOpenDrawer(position)}
          >
            Open {position} Drawer
          </Button>
        ))}
        
        {positions.map((position) => (
          <Drawer
            key={position}
            isOpen={openDrawer === position}
            onClose={() => setOpenDrawer(null)}
            position={position}
          >
            <DrawerHeader>
              <DrawerTitle>{position.charAt(0).toUpperCase() + position.slice(1)} Drawer</DrawerTitle>
              <DrawerDescription>
                This drawer slides in from the {position}
              </DrawerDescription>
            </DrawerHeader>
            <DrawerBody>
              <p className="text-slate-300">
                Drawer position: {position}
              </p>
            </DrawerBody>
            <DrawerFooter>
              <Button variant="primary" onClick={() => setOpenDrawer(null)}>
                Close
              </Button>
            </DrawerFooter>
          </Drawer>
        ))}
      </div>
    );
  },
};

export const TechnologyDetailsModal: StoryObj = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <>
        <Card variant="glass" className="p-4 cursor-pointer hover:bg-slate-800/40" onClick={() => setIsOpen(true)}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Code2 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">React</h3>
              <p className="text-sm text-slate-400">Click for details</p>
            </div>
          </div>
        </Card>
        
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="lg">
          <ModalHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Code2 className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <ModalTitle>React</ModalTitle>
                <ModalDescription>
                  A JavaScript library for building user interfaces
                </ModalDescription>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              <div className="flex gap-2">
                <Badge variant="primary">Frontend</Badge>
                <Badge variant="success">Free</Badge>
                <Badge variant="warning">Intermediate</Badge>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-slate-200 mb-2">Overview</h4>
                <p className="text-slate-300 text-sm">
                  React is a declarative, efficient, and flexible JavaScript library for building user interfaces. 
                  It lets you compose complex UIs from small and isolated pieces of code called "components".
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Card variant="solid" className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-200">Setup Time</span>
                  </div>
                  <p className="text-2xl font-semibold text-slate-100">2-4 hours</p>
                </Card>
                <Card variant="solid" className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-200">Learning Curve</span>
                  </div>
                  <p className="text-2xl font-semibold text-slate-100">Moderate</p>
                </Card>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-slate-200 mb-2">Key Features</h4>
                <ul className="space-y-1 text-sm text-slate-300">
                  <li>• Component-based architecture</li>
                  <li>• Virtual DOM for performance</li>
                  <li>• Rich ecosystem and community</li>
                  <li>• Excellent developer tools</li>
                </ul>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={() => setIsOpen(false)}>
              Add to Stack
            </Button>
          </ModalFooter>
        </Modal>
      </>
    );
  },
};