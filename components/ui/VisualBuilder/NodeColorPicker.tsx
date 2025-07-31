'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Palette,
  X,
  RotateCcw,
  Layers,
  Monitor,
  Server,
  Database,
  Cloud,
  Smartphone,
  Brain,
  Settings as SettingsIcon
} from 'lucide-react';

export interface NodeCustomStyle {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  borderColor: string;
  customGradient?: string;
}

export interface StyledNodeData {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'mobile' | 'ai' | 'other' | 'testing' | 'ui-ux' | 'state-management' | 'routing' | 'documentation' | 'build-tools' | 'linting';
  description: string;
  setupTimeHours: number;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  pricing: 'free' | 'freemium' | 'paid';
  customStyle?: NodeCustomStyle;
}

interface NodeColorPickerProps {
  node: StyledNodeData;
  onStyleChange: (nodeId: string, style: NodeCustomStyle) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

// Couleurs par défaut pour chaque catégorie
const defaultCategoryStyles: Record<string, NodeCustomStyle> = {
  frontend: {
    primaryColor: '#3b82f6',
    secondaryColor: '#06b6d4',
    textColor: '#dbeafe',
    borderColor: '#60a5fa',
  },
  backend: {
    primaryColor: '#10b981',
    secondaryColor: '#059669',
    textColor: '#d1fae5',
    borderColor: '#34d399',
  },
  database: {
    primaryColor: '#8b5cf6',
    secondaryColor: '#7c3aed',
    textColor: '#ede9fe',
    borderColor: '#a78bfa',
  },
  devops: {
    primaryColor: '#f59e0b',
    secondaryColor: '#d97706',
    textColor: '#fef3c7',
    borderColor: '#fbbf24',
  },
  mobile: {
    primaryColor: '#ec4899',
    secondaryColor: '#db2777',
    textColor: '#fce7f3',
    borderColor: '#f472b6',
  },
  ai: {
    primaryColor: '#eab308',
    secondaryColor: '#ca8a04',
    textColor: '#fefce8',
    borderColor: '#facc15',
  },
  other: {
    primaryColor: '#6b7280',
    secondaryColor: '#4b5563',
    textColor: '#f3f4f6',
    borderColor: '#9ca3af',
  },
};

// Palettes de couleurs thématiques
const colorThemes = {
  'Ocean': ['#0ea5e9', '#06b6d4', '#0891b2', '#0e7490'],
  'Forest': ['#059669', '#10b981', '#047857', '#065f46'],
  'Sunset': ['#f59e0b', '#f97316', '#ea580c', '#dc2626'],
  'Purple': ['#8b5cf6', '#a855f7', '#9333ea', '#7c3aed'],
  'Pink': ['#ec4899', '#f472b6', '#e879f9', '#d946ef'],
  'Neon': ['#00ff88', '#00d4ff', '#ff006e', '#8338ec'],
  'Dark': ['#374151', '#4b5563', '#6b7280', '#9ca3af'],
  'Warm': ['#fbbf24', '#f59e0b', '#d97706', '#b45309'],
};

const categoryIcons = {
  frontend: Monitor,
  backend: Server,
  database: Database,
  devops: Cloud,
  mobile: Smartphone,
  ai: Brain,
  other: SettingsIcon,
};

export const NodeColorPicker: React.FC<NodeColorPickerProps> = ({
  node,
  onStyleChange,
  onClose,
  position
}) => {
  const [currentStyle, setCurrentStyle] = useState<NodeCustomStyle>(
    node.customStyle || defaultCategoryStyles[node.category] || defaultCategoryStyles.other
  );

  const handleStyleUpdate = (updates: Partial<NodeCustomStyle>) => {
    const newStyle = { ...currentStyle, ...updates };
    setCurrentStyle(newStyle);
    onStyleChange(node.id, newStyle);
  };

  const applyTheme = (themeName: string) => {
    const colors = colorThemes[themeName as keyof typeof colorThemes];
    const newStyle: NodeCustomStyle = {
      primaryColor: colors[0],
      secondaryColor: colors[1],
      textColor: '#ffffff',
      borderColor: colors[2],
      customGradient: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`
    };
    setCurrentStyle(newStyle);
    onStyleChange(node.id, newStyle);
  };

  const resetToDefault = () => {
    const defaultStyle = defaultCategoryStyles[node.category] || defaultCategoryStyles.other;
    setCurrentStyle(defaultStyle);
    onStyleChange(node.id, defaultStyle);
  };

  const generateGradient = () => {
    const gradient = `linear-gradient(135deg, ${currentStyle.primaryColor}, ${currentStyle.secondaryColor})`;
    handleStyleUpdate({ customGradient: gradient });
  };

  // Composant de prévisualisation
  const NodePreview = ({ style }: { style: NodeCustomStyle }) => {
    const Icon = categoryIcons[node.category] || SettingsIcon;
    
    return (
      <div
        className="w-24 h-16 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-200 mx-auto"
        style={{
          background: style.customGradient || `linear-gradient(135deg, ${style.primaryColor}, ${style.secondaryColor})`,
          borderColor: style.borderColor,
          color: style.textColor
        }}
      >
        <Icon className="w-4 h-4 mb-1" />
        <span className="text-xs font-medium">{node.name.slice(0, 8)}</span>
      </div>
    );
  };

  return (
    <div
      className="fixed z-50 w-80"
      style={{
        left: Math.min(position.x, window.innerWidth - 320),
        top: Math.min(position.y, window.innerHeight - 600),
      }}
    >
      <Card variant="glass" className="border-slate-600">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Customize Node
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Preview */}
          <div className="bg-slate-800/50 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-3">Preview:</p>
            <NodePreview style={currentStyle} />
          </div>

          {/* Quick Theme Presets */}
          <div>
            <p className="text-xs font-medium text-slate-300 mb-2">Color Themes:</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(colorThemes).map(([name, colors]) => (
                <Button
                  key={name}
                  variant="ghost"
                  size="sm"
                  className="justify-start text-xs p-2"
                  onClick={() => applyTheme(name)}
                >
                  <div className="flex gap-1 mr-2">
                    {colors.slice(0, 2).map((color, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  {name}
                </Button>
              ))}
            </div>
          </div>

          {/* Primary Color */}
          <div>
            <p className="text-xs font-medium text-slate-300 mb-2">Primary Color:</p>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentStyle.primaryColor}
                onChange={(e) => handleStyleUpdate({ primaryColor: e.target.value })}
                className="w-12 h-8 rounded border border-slate-600 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={currentStyle.primaryColor}
                onChange={(e) => handleStyleUpdate({ primaryColor: e.target.value })}
                className="flex-1 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs"
                placeholder="#3b82f6"
              />
            </div>
          </div>

          {/* Secondary Color */}
          <div>
            <p className="text-xs font-medium text-slate-300 mb-2">Secondary Color:</p>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentStyle.secondaryColor}
                onChange={(e) => handleStyleUpdate({ secondaryColor: e.target.value })}
                className="w-12 h-8 rounded border border-slate-600 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={currentStyle.secondaryColor}
                onChange={(e) => handleStyleUpdate({ secondaryColor: e.target.value })}
                className="flex-1 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs"
                placeholder="#06b6d4"
              />
            </div>
          </div>

          {/* Border Color */}
          <div>
            <p className="text-xs font-medium text-slate-300 mb-2">Border Color:</p>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentStyle.borderColor}
                onChange={(e) => handleStyleUpdate({ borderColor: e.target.value })}
                className="w-12 h-8 rounded border border-slate-600 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={currentStyle.borderColor}
                onChange={(e) => handleStyleUpdate({ borderColor: e.target.value })}
                className="flex-1 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs"
                placeholder="#60a5fa"
              />
            </div>
          </div>

          {/* Text Color */}
          <div>
            <p className="text-xs font-medium text-slate-300 mb-2">Text Color:</p>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentStyle.textColor}
                onChange={(e) => handleStyleUpdate({ textColor: e.target.value })}
                className="w-12 h-8 rounded border border-slate-600 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={currentStyle.textColor}
                onChange={(e) => handleStyleUpdate({ textColor: e.target.value })}
                className="flex-1 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs"
                placeholder="#dbeafe"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 text-xs"
              onClick={generateGradient}
            >
              <Layers className="w-3 h-3 mr-1" />
              Generate Gradient
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={resetToDefault}
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          </div>

          {/* Category Info */}
          <div className="text-xs text-slate-400 bg-slate-800/30 rounded p-2">
            <p className="flex items-center gap-1">
              <Badge variant="secondary" size="sm">{node.category}</Badge>
              <span>• {node.difficulty}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};