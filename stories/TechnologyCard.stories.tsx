import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TechnologyCard, DraggableTechnologyCard, Technology } from '@/components/ui/TechnologyCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const meta: Meta<typeof TechnologyCard> = {
  title: 'UI/TechnologyCard',
  component: TechnologyCard,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleTechnologies: Technology[] = [
  {
    id: '1',
    name: 'React',
    category: 'frontend',
    description: 'A JavaScript library for building user interfaces with component-based architecture.',
    logoUrl: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg',
    documentationUrl: 'https://react.dev',
    setupTimeHours: 2,
    difficulty: 'intermediate',
    pricing: 'free',
    stars: 4.8,
    compatibility: {
      compatible: ['Node.js', 'TypeScript', 'Tailwind CSS'],
      incompatible: [],
    },
  },
  {
    id: '2',
    name: 'PostgreSQL',
    category: 'database',
    description: 'Powerful, open source object-relational database system with strong reputation for reliability.',
    logoUrl: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg',
    documentationUrl: 'https://www.postgresql.org/docs/',
    setupTimeHours: 3,
    difficulty: 'intermediate',
    pricing: 'free',
    stars: 4.7,
  },
  {
    id: '3',
    name: 'Docker',
    category: 'devops',
    description: 'Platform for developing, shipping, and running applications in containers.',
    logoUrl: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg',
    documentationUrl: 'https://docs.docker.com',
    setupTimeHours: 4,
    difficulty: 'expert',
    pricing: 'freemium',
    stars: 4.6,
  },
  {
    id: '4',
    name: 'Next.js',
    category: 'frontend',
    description: 'The React Framework for Production - hybrid static & server rendering, smart bundling, and more.',
    logoUrl: 'https://raw.githubusercontent.com/devicons/devicon/master/icons/nextjs/nextjs-original.svg',
    documentationUrl: 'https://nextjs.org/docs',
    setupTimeHours: 3,
    difficulty: 'intermediate',
    pricing: 'free',
    stars: 4.9,
  },
  {
    id: '5',
    name: 'OpenAI GPT',
    category: 'ai',
    description: 'Advanced language models that can understand and generate natural language.',
    setupTimeHours: 1,
    difficulty: 'beginner',
    pricing: 'paid',
    stars: 4.5,
  },
];

export const Default: Story = {
  args: {
    technology: sampleTechnologies[0],
  },
};

export const CompactView: Story = {
  args: {
    technology: sampleTechnologies[0],
    isCompact: true,
  },
};

export const Selected: Story = {
  args: {
    technology: sampleTechnologies[0],
    selected: true,
  },
};

export const WithoutDetails: Story = {
  args: {
    technology: sampleTechnologies[0],
    showDetails: false,
  },
};

export const DifferentCategories: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {sampleTechnologies.map((tech) => (
        <TechnologyCard key={tech.id} technology={tech} />
      ))}
    </div>
  ),
};

export const InteractiveSelection: Story = {
  render: () => {
    const [selectedTechs, setSelectedTechs] = useState<string[]>([]);

    const toggleSelection = (id: string) => {
      setSelectedTechs((prev) =>
        prev.includes(id) ? prev.filter((techId) => techId !== id) : [...prev, id]
      );
    };

    return (
      <div className="w-full max-w-4xl">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-100">
            Select technologies for your stack
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Selected: {selectedTechs.length} technologies
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleTechnologies.map((tech) => (
            <TechnologyCard
              key={tech.id}
              technology={tech}
              selected={selectedTechs.includes(tech.id)}
              onSelect={() => toggleSelection(tech.id)}
            />
          ))}
        </div>
      </div>
    );
  },
};

export const CompactGrid: Story = {
  render: () => {
    const [selectedTechs, setSelectedTechs] = useState<string[]>([]);

    const toggleSelection = (id: string) => {
      setSelectedTechs((prev) =>
        prev.includes(id) ? prev.filter((techId) => techId !== id) : [...prev, id]
      );
    };

    return (
      <Card variant="glass" className="w-96">
        <CardHeader>
          <CardTitle>Choose Technologies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sampleTechnologies.map((tech) => (
              <TechnologyCard
                key={tech.id}
                technology={tech}
                isCompact
                selected={selectedTechs.includes(tech.id)}
                onSelect={() => toggleSelection(tech.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  },
};

export const DragAndDrop: Story = {
  render: () => {
    const [technologies, setTechnologies] = useState(sampleTechnologies);
    
    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    const handleDragEnd = (event: any) => {
      const { active, over } = event;

      if (active.id !== over.id) {
        setTechnologies((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    };

    return (
      <div className="w-full max-w-2xl">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-100">
            Drag to reorder your stack
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Arrange technologies in your preferred order
          </p>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={technologies.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {technologies.map((tech) => (
                <DraggableTechnologyCard
                  key={tech.id}
                  id={tech.id}
                  technology={tech}
                  showDetails={false}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    );
  },
};

export const MixedLayouts: Story = {
  render: () => {
    const frontend = sampleTechnologies.filter(t => t.category === 'frontend');
    const backend = sampleTechnologies.filter(t => t.category !== 'frontend');

    return (
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-slate-100">Featured Technologies</h3>
          {frontend.map((tech) => (
            <TechnologyCard key={tech.id} technology={tech} />
          ))}
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-100">Quick Add</h3>
          <Card variant="glass">
            <CardContent className="p-4">
              <div className="space-y-2">
                {backend.map((tech) => (
                  <TechnologyCard
                    key={tech.id}
                    technology={tech}
                    isCompact
                    onSelect={() => console.log(`Selected ${tech.name}`)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  },
};