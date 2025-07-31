'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  Minus, 
  MoreHorizontal, 
  Zap, 
  ArrowRight,
  X,
  Palette,
  Settings
} from 'lucide-react';

export interface ConnectionStyle {
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted' | 'animated';
  color: string;
  animation?: 'flow' | 'pulse' | 'glow' | 'none';
  opacity: number;
}

export interface StyledConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourcePosition: { x: number; y: number };
  targetPosition: { x: number; y: number };
  type: 'compatible' | 'incompatible' | 'neutral';
  style?: ConnectionStyle;
}

interface ConnectionStyleEditorProps {
  connection?: StyledConnection;
  connectionId?: string;
  currentStyle?: ConnectionStyle;
  onStyleChange: (connectionId: string, style: ConnectionStyle) => void;
  onClose: () => void;
  position?: { x: number; y: number };
}

const defaultStyles: Record<string, ConnectionStyle> = {
  'API Call': {
    strokeWidth: 2,
    strokeStyle: 'animated',
    color: '#3b82f6', // blue-500
    animation: 'flow',
    opacity: 1
  },
  'Data Flow': {
    strokeWidth: 3,
    strokeStyle: 'solid',
    color: '#10b981', // emerald-500
    animation: 'none',
    opacity: 0.9
  },
  'Event': {
    strokeWidth: 1,
    strokeStyle: 'dashed',
    color: '#f59e0b', // amber-500
    animation: 'pulse',
    opacity: 0.8
  },
  'Dependency': {
    strokeWidth: 2,
    strokeStyle: 'dotted',
    color: '#8b5cf6', // violet-500
    animation: 'none',
    opacity: 0.7
  },
  'Error': {
    strokeWidth: 2,
    strokeStyle: 'dashed',
    color: '#ef4444', // red-500
    animation: 'glow',
    opacity: 1
  }
};

const colorPalette = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Gray', value: '#6b7280' },
];

const strokeStyles = [
  { name: 'Solid', value: 'solid' as const, icon: Minus },
  { name: 'Dashed', value: 'dashed' as const, icon: MoreHorizontal },
  { name: 'Dotted', value: 'dotted' as const, icon: MoreHorizontal },
  { name: 'Animated', value: 'animated' as const, icon: Zap },
];

const animations = [
  { name: 'None', value: 'none' as const },
  { name: 'Flow', value: 'flow' as const },
  { name: 'Pulse', value: 'pulse' as const },
  { name: 'Glow', value: 'glow' as const },
];

export const ConnectionStyleEditor: React.FC<ConnectionStyleEditorProps> = ({
  connection,
  connectionId,
  currentStyle: initialStyle,
  onStyleChange,
  onClose,
  position
}) => {
  const [currentStyle, setCurrentStyle] = useState<ConnectionStyle>(
    initialStyle || connection?.style || defaultStyles['API Call']
  );

  const handleApplyPreset = (presetName: string) => {
    const preset = defaultStyles[presetName];
    setCurrentStyle(preset);
    const id = connectionId || connection?.id;
    if (id) {
      onStyleChange(id, preset);
    }
  };

  const handleStyleUpdate = (updates: Partial<ConnectionStyle>) => {
    const newStyle = { ...currentStyle, ...updates };
    setCurrentStyle(newStyle);
    const id = connectionId || connection?.id;
    if (id) {
      onStyleChange(id, newStyle);
    }
  };

  // Preview line component
  const PreviewLine = ({ style }: { style: ConnectionStyle }) => (
    <svg width="120" height="40" className="mx-auto">
      <defs>
        <marker
          id="preview-arrow"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L8,3 z" fill={style.color} />
        </marker>
      </defs>
      <path
        d="M10 20 Q40 10, 70 20 Q90 30, 110 20"
        fill="none"
        stroke={style.color}
        strokeWidth={style.strokeWidth}
        strokeDasharray={
          style.strokeStyle === 'dashed' ? '8,4' :
          style.strokeStyle === 'dotted' ? '2,2' :
          style.strokeStyle === 'animated' ? '8,4' : 'none'
        }
        opacity={style.opacity}
        markerEnd="url(#preview-arrow)"
        className={cn(
          style.animation === 'pulse' && 'animate-pulse',
          style.animation === 'flow' && style.strokeStyle === 'animated' && 'animate-pulse'
        )}
      >
        {style.animation === 'flow' && style.strokeStyle === 'animated' && (
          <animate
            attributeName="stroke-dasharray"
            values="0,12;12,0;0,12"
            dur="2s"
            repeatCount="indefinite"
          />
        )}
      </path>
    </svg>
  );

  return (
    <>
      {/* Overlay for closing */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        className="fixed w-80 pointer-events-auto"
        style={{
          left: Math.min(position?.x || 100, window.innerWidth - 320),
          top: Math.min(position?.y || 100, window.innerHeight - 500),
          zIndex: 9999,
          pointerEvents: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onMouseUp={(e) => e.stopPropagation()}
      >
      <Card variant="glass" className="border-slate-600">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Connection Style
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Preview */}
          <div className="bg-slate-800/50 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-2">Preview:</p>
            <PreviewLine style={currentStyle} />
          </div>

          {/* Quick Presets */}
          <div>
            <p className="text-xs font-medium text-slate-300 mb-2">Quick Presets:</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(defaultStyles).map(([name, preset]) => (
                <Button
                  key={name}
                  variant="ghost"
                  size="sm"
                  className="justify-start text-xs"
                  onClick={() => handleApplyPreset(name)}
                >
                  <div 
                    className="w-3 h-0.5 mr-2 rounded"
                    style={{ backgroundColor: preset.color }}
                  />
                  {name}
                </Button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <p className="text-xs font-medium text-slate-300 mb-2">Color:</p>
            <div className="grid grid-cols-4 gap-2">
              {colorPalette.map((color) => (
                <button
                  key={color.value}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    currentStyle.color === color.value 
                      ? "border-white scale-110" 
                      : "border-slate-600 hover:border-slate-400"
                  )}
                  style={{ backgroundColor: color.value }}
                  onClick={() => handleStyleUpdate({ color: color.value })}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Stroke Style */}
          <div>
            <p className="text-xs font-medium text-slate-300 mb-2">Line Style:</p>
            <div className="grid grid-cols-2 gap-2">
              {strokeStyles.map((style) => {
                const Icon = style.icon;
                return (
                  <Button
                    key={style.value}
                    variant={currentStyle.strokeStyle === style.value ? "primary" : "ghost"}
                    size="sm"
                    className="justify-start text-xs"
                    onClick={() => handleStyleUpdate({ strokeStyle: style.value })}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {style.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Stroke Width */}
          <div>
            <p className="text-xs font-medium text-slate-300 mb-2">
              Thickness: {currentStyle.strokeWidth}px
            </p>
            <input
              type="range"
              min="1"
              max="6"
              value={currentStyle.strokeWidth}
              onChange={(e) => handleStyleUpdate({ strokeWidth: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Animation */}
          <div>
            <p className="text-xs font-medium text-slate-300 mb-2">Animation:</p>
            <div className="grid grid-cols-2 gap-2">
              {animations.map((anim) => (
                <Button
                  key={anim.value}
                  variant={currentStyle.animation === anim.value ? "primary" : "ghost"}
                  size="sm"
                  className="text-xs"
                  onClick={() => handleStyleUpdate({ animation: anim.value })}
                >
                  {anim.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Opacity */}
          <div>
            <p className="text-xs font-medium text-slate-300 mb-2">
              Opacity: {Math.round(currentStyle.opacity * 100)}%
            </p>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.1"
              value={currentStyle.opacity}
              onChange={(e) => handleStyleUpdate({ opacity: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
};