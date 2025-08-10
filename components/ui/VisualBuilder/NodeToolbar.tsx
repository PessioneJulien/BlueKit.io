'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { FloatingToolbar } from './FloatingToolbar';
import { NodeCustomStyle } from './NodeColorPicker';
import { 
  Palette,
  Settings,
  Layers
} from 'lucide-react';

interface NodeToolbarProps {
  nodeId: string;
  nodeName: string;
  currentStyle?: NodeCustomStyle;
  onStyleChange: (nodeId: string, style: NodeCustomStyle) => void;
  onClose: () => void;
}

const colorThemes = {
  'Ocean': {
    primaryColor: '#0ea5e9',
    secondaryColor: '#0284c7',
    borderColor: '#0369a1',
    textColor: '#ffffff',
    customGradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)'
  },
  'Forest': {
    primaryColor: '#059669',
    secondaryColor: '#047857',
    borderColor: '#065f46',
    textColor: '#ffffff',
    customGradient: 'linear-gradient(135deg, #059669, #047857)'
  },
  'Sunset': {
    primaryColor: '#ea580c',
    secondaryColor: '#dc2626',
    borderColor: '#b91c1c',
    textColor: '#ffffff',
    customGradient: 'linear-gradient(135deg, #ea580c, #dc2626)'
  },
  'Purple': {
    primaryColor: '#9333ea',
    secondaryColor: '#7c3aed',
    borderColor: '#6d28d9',
    textColor: '#ffffff',
    customGradient: 'linear-gradient(135deg, #9333ea, #7c3aed)'
  },
  'Rose': {
    primaryColor: '#e11d48',
    secondaryColor: '#be185d',
    borderColor: '#9f1239',
    textColor: '#ffffff',
    customGradient: 'linear-gradient(135deg, #e11d48, #be185d)'
  },
  'Emerald': {
    primaryColor: '#10b981',
    secondaryColor: '#059669',
    borderColor: '#047857',
    textColor: '#ffffff',
    customGradient: 'linear-gradient(135deg, #10b981, #059669)'
  },
  'Dark': {
    primaryColor: '#374151',
    secondaryColor: '#1f2937',
    borderColor: '#111827',
    textColor: '#f9fafb',
    customGradient: 'linear-gradient(135deg, #374151, #1f2937)'
  },
  'Light': {
    primaryColor: '#f3f4f6',
    secondaryColor: '#e5e7eb',
    borderColor: '#d1d5db',
    textColor: '#111827',
    customGradient: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)'
  }
};

const categoryPresets = {
  'Frontend': colorThemes.Ocean,
  'Backend': colorThemes.Forest,
  'Database': colorThemes.Purple,
  'DevOps': colorThemes.Sunset,
  'Mobile': colorThemes.Rose,
  'AI/ML': colorThemes.Emerald
};

const quickColors = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Pink', value: '#ec4899' },
];

export const NodeToolbar: React.FC<NodeToolbarProps> = ({
  nodeId,
  nodeName,
  currentStyle,
  onStyleChange,
  onClose
}) => {
  const [style, setStyle] = useState<NodeCustomStyle>(
    currentStyle || colorThemes.Ocean
  );

  const handleStyleUpdate = (updates: Partial<NodeCustomStyle>) => {
    const newStyle = { ...style, ...updates };
    setStyle(newStyle);
    onStyleChange(nodeId, newStyle);
  };

  const handleApplyTheme = (theme: NodeCustomStyle) => {
    setStyle(theme);
    onStyleChange(nodeId, theme);
  };

  const handleQuickColor = (color: string) => {
    const newStyle = {
      ...style,
      primaryColor: color,
      secondaryColor: adjustBrightness(color, -20),
      borderColor: adjustBrightness(color, -40),
      customGradient: `linear-gradient(135deg, ${color}, ${adjustBrightness(color, -20)})`
    };
    setStyle(newStyle);
    onStyleChange(nodeId, newStyle);
  };

  // Helper function to adjust color brightness
  const adjustBrightness = (color: string, percent: number) => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  return (
    <FloatingToolbar
      title={nodeName.length > 10 ? nodeName.substring(0, 10) + '...' : nodeName}
      icon={<Layers className="w-4 h-4" />}
      iconColor="text-purple-400"
      onClose={onClose}
    >

      {/* Category Presets */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-slate-400 text-xs">Category:</span>
        {Object.entries(categoryPresets).slice(0, 3).map(([name, theme]) => (
          <Button
            key={name}
            variant="ghost"
            size="sm"
            onClick={() => handleApplyTheme(theme)}
            className="text-xs px-2 py-1 h-6"
          >
            {name}
          </Button>
        ))}
      </div>

      {/* Color Themes */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-slate-400 text-xs">Theme:</span>
        <div className="flex gap-1">
          {Object.entries(colorThemes).slice(0, 4).map(([name, theme]) => (
            <button
              key={name}
              onClick={() => handleApplyTheme(theme)}
              className={cn(
                "w-6 h-6 rounded border transition-all flex items-center justify-center",
                JSON.stringify(style.customGradient) === JSON.stringify(theme.customGradient)
                  ? "border-white ring-1 ring-white" 
                  : "border-slate-600 hover:border-slate-500"
              )}
              style={{ background: theme.customGradient }}
              title={name}
            >
              {JSON.stringify(style.customGradient) === JSON.stringify(theme.customGradient) && (
                <div className="w-2 h-2 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Colors */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-slate-400 text-xs">Quick:</span>
        <div className="flex gap-1">
          {quickColors.slice(0, 4).map((color) => (
            <button
              key={color.value}
              onClick={() => handleQuickColor(color.value)}
              className={cn(
                "w-6 h-6 rounded border transition-all",
                style.primaryColor === color.value 
                  ? "border-white ring-1 ring-white" 
                  : "border-slate-600 hover:border-slate-500"
              )}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-slate-400 text-xs">Custom:</span>
        <input
          type="color"
          value={style.primaryColor}
          onChange={(e) => handleQuickColor(e.target.value)}
          className="w-6 h-6 rounded border border-slate-600 bg-transparent cursor-pointer"
          title="Primary"
        />
        <input
          type="color"
          value={style.textColor}
          onChange={(e) => handleStyleUpdate({ textColor: e.target.value })}
          className="w-6 h-6 rounded border border-slate-600 bg-transparent cursor-pointer"
          title="Text"
        />
      </div>

      {/* Reset */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleApplyTheme(colorThemes.Ocean)}
        className="text-xs px-2 py-1 h-6 flex-shrink-0"
      >
        Reset
      </Button>

    </FloatingToolbar>
  );
};