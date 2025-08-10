'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { FloatingToolbar } from './FloatingToolbar';
import { ConnectionStyle } from './ConnectionStyleEditor';
import { 
  Minus, 
  MoreHorizontal, 
  Zap, 
  Palette,
  Settings,
  Circle
} from 'lucide-react';

interface ConnectionToolbarProps {
  connectionId: string;
  currentStyle?: ConnectionStyle;
  onStyleChange: (connectionId: string, style: ConnectionStyle) => void;
  onClose: () => void;
}

const defaultStyles: Record<string, ConnectionStyle> = {
  'API Call': {
    strokeWidth: 2,
    strokeStyle: 'solid',
    color: '#3b82f6',
    animation: 'none',
    opacity: 1,
  },
  'Data Flow': {
    strokeWidth: 3,
    strokeStyle: 'animated',
    color: '#10b981',
    animation: 'flow',
    opacity: 0.9,
  },
  'Event': {
    strokeWidth: 2,
    strokeStyle: 'dashed',
    color: '#f59e0b',
    animation: 'pulse',
    opacity: 0.8,
  },
  'Error Flow': {
    strokeWidth: 2,
    strokeStyle: 'dotted',
    color: '#ef4444',
    animation: 'glow',
    opacity: 0.7,
  },
};

// Custom mini icons for stroke styles
const SolidIcon = () => <div className="w-4 h-0.5 bg-current rounded" />;
const DashedIcon = () => <div className="flex gap-0.5"><div className="w-1 h-0.5 bg-current rounded" /><div className="w-1 h-0.5 bg-current rounded" /><div className="w-1 h-0.5 bg-current rounded" /></div>;
const DottedIcon = () => <div className="flex gap-0.5"><div className="w-0.5 h-0.5 bg-current rounded-full" /><div className="w-0.5 h-0.5 bg-current rounded-full" /><div className="w-0.5 h-0.5 bg-current rounded-full" /><div className="w-0.5 h-0.5 bg-current rounded-full" /></div>;

const strokeStyles = [
  { name: 'Solid', value: 'solid' as const, icon: SolidIcon },
  { name: 'Dashed', value: 'dashed' as const, icon: DashedIcon },
  { name: 'Dotted', value: 'dotted' as const, icon: DottedIcon },
  { name: 'Animated', value: 'animated' as const, icon: Zap },
];

const animations = [
  { name: 'None', value: 'none' as const },
  { name: 'Flow', value: 'flow' as const },
  { name: 'Pulse', value: 'pulse' as const },
  { name: 'Glow', value: 'glow' as const },
];

const colorPresets = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Yellow', value: '#f59e0b' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
];

export const ConnectionToolbar: React.FC<ConnectionToolbarProps> = ({
  connectionId,
  currentStyle,
  onStyleChange,
  onClose
}) => {
  const [style, setStyle] = useState<ConnectionStyle>(
    currentStyle || defaultStyles['API Call']
  );

  const handleStyleUpdate = (updates: Partial<ConnectionStyle>) => {
    const newStyle = { ...style, ...updates };
    setStyle(newStyle);
    onStyleChange(connectionId, newStyle);
  };

  const handleApplyPreset = (presetName: string) => {
    const preset = defaultStyles[presetName];
    setStyle(preset);
    onStyleChange(connectionId, preset);
  };

  return (
    <FloatingToolbar
      title="Connection"
      icon={<Settings className="w-4 h-4" />}
      iconColor="text-blue-400"
      onClose={onClose}
    >

      {/* Presets - Compact */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-slate-400 text-xs">Quick:</span>
        {Object.keys(defaultStyles).slice(0, 2).map((presetName) => (
          <Button
            key={presetName}
            variant="ghost"
            size="sm"
            onClick={() => handleApplyPreset(presetName)}
            className="text-xs px-2 py-1 h-6"
          >
            {presetName === 'API Call' ? 'API' : presetName === 'Data Flow' ? 'Flow' : presetName}
          </Button>
        ))}
      </div>

      {/* Stroke Style - Icons only */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-slate-400 text-xs">Style:</span>
        <div className="flex gap-1">
          {strokeStyles.map((strokeStyle) => (
            <Button
              key={strokeStyle.value}
              variant={style.strokeStyle === strokeStyle.value ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleStyleUpdate({ strokeStyle: strokeStyle.value })}
              className="p-1 h-7 w-7 flex items-center justify-center"
              title={strokeStyle.name}
            >
              {strokeStyle.value === 'animated' ? (
                <Zap className="w-4 h-4" />
              ) : (
                <strokeStyle.icon />
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Colors - Reduced set */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-slate-400 text-xs">Color:</span>
        <div className="flex gap-1">
          {colorPresets.slice(0, 4).map((color) => (
            <button
              key={color.value}
              onClick={() => handleStyleUpdate({ color: color.value })}
              className={cn(
                "w-6 h-6 rounded border transition-all",
                style.color === color.value 
                  ? "border-white ring-1 ring-white" 
                  : "border-slate-600 hover:border-slate-500"
              )}
              style={{ backgroundColor: color.value }}
              title={color.name}
            />
          ))}
          <input
            type="color"
            value={style.color}
            onChange={(e) => handleStyleUpdate({ color: e.target.value })}
            className="w-6 h-6 rounded border border-slate-600 bg-transparent cursor-pointer"
            title="Custom"
          />
        </div>
      </div>

      {/* Animation */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-slate-400 text-xs">Anim:</span>
        <select
          value={style.animation || 'none'}
          onChange={(e) => handleStyleUpdate({ animation: e.target.value as 'none' | 'flow' | 'pulse' | 'glow' })}
          className="bg-slate-700 border border-slate-600 rounded px-1 py-1 text-slate-200 text-xs w-16"
        >
          {animations.map((anim) => (
            <option key={anim.value} value={anim.value}>
              {anim.name}
            </option>
          ))}
        </select>
      </div>

      {/* Stroke Width */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-slate-400 text-xs">W:</span>
        <input
          type="range"
          min="1"
          max="8"
          step="1"
          value={style.strokeWidth}
          onChange={(e) => handleStyleUpdate({ strokeWidth: parseInt(e.target.value) })}
          className="w-12 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-slate-300 text-xs w-2">{style.strokeWidth}</span>
      </div>

      {/* Opacity */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-slate-400 text-xs">Op:</span>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={style.opacity}
          onChange={(e) => handleStyleUpdate({ opacity: parseFloat(e.target.value) })}
          className="w-12 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-slate-300 text-xs w-6">{Math.round(style.opacity * 100)}%</span>
      </div>

    </FloatingToolbar>
  );
};