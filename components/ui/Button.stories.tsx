import type { Meta, StoryObj } from '@storybook/nextjs'
import { Button } from './Button'
import { ArrowRight, Download, Heart, Plus, Settings, Trash2 } from 'lucide-react'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/example', // Remplacer par le vrai lien Figma si disponible
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
      description: 'Le style visuel du bouton',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'La taille du bouton',
    },
    isLoading: {
      control: 'boolean',
      description: 'État de chargement du bouton',
    },
    disabled: {
      control: 'boolean',
      description: 'État désactivé du bouton',
    },
    children: {
      control: 'text',
      description: 'Le contenu textuel du bouton',
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// Histoires de base
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Créer une stack',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Voir les détails',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Annuler',
  },
}

// Tailles
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Petit bouton',
  },
}

export const Medium: Story = {
  args: {
    size: 'md',
    children: 'Bouton moyen',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Grand bouton',
  },
}

// États
export const Loading: Story = {
  args: {
    isLoading: true,
    children: 'Chargement...',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Désactivé',
  },
}

// Avec icônes
export const WithLeftIcon: Story = {
  args: {
    leftIcon: <Plus className="w-4 h-4" />,
    children: 'Ajouter une technologie',
  },
}

export const WithRightIcon: Story = {
  args: {
    rightIcon: <ArrowRight className="w-4 h-4" />,
    children: 'Suivant',
  },
}

export const WithBothIcons: Story = {
  args: {
    leftIcon: <Download className="w-4 h-4" />,
    rightIcon: <ArrowRight className="w-4 h-4" />,
    children: 'Télécharger',
  },
}

// Cas d'usage réels
export const CTAButton: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    rightIcon: <ArrowRight className="w-5 h-5" />,
    children: 'Commencer gratuitement',
  },
}

export const DangerButton: Story = {
  args: {
    variant: 'secondary',
    leftIcon: <Trash2 className="w-4 h-4" />,
    children: 'Supprimer',
    className: 'bg-red-600 hover:bg-red-700 border-red-600',
  },
}

export const SettingsButton: Story = {
  args: {
    variant: 'ghost',
    leftIcon: <Settings className="w-4 h-4" />,
    children: 'Paramètres',
  },
}

export const FavoriteButton: Story = {
  args: {
    variant: 'ghost',
    size: 'sm',
    leftIcon: <Heart className="w-4 h-4" />,
    children: '124',
  },
}

// Groupe de boutons
export const ButtonGroup: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Button variant="primary">Sauvegarder</Button>
      <Button variant="secondary">Aperçu</Button>
      <Button variant="ghost">Annuler</Button>
    </div>
  ),
}

// Responsive buttons
export const ResponsiveButtons: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-400 mb-2">Variantes par taille:</div>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex gap-4 items-center">
          <Button variant="primary" size={size}>
            Primary {size}
          </Button>
          <Button variant="secondary" size={size}>
            Secondary {size}
          </Button>
          <Button variant="ghost" size={size}>
            Ghost {size}
          </Button>
        </div>
      ))}
    </div>
  ),
}

// États interactifs
export const InteractiveStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-400 mb-2">États interactifs:</div>
      <div className="flex gap-4 items-center">
        <Button>Normal</Button>
        <Button className="hover:scale-105">Hover me</Button>
        <Button disabled>Disabled</Button>
        <Button isLoading>Loading</Button>
      </div>
    </div>
  ),
}