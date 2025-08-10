'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { FloatingToolbar } from './FloatingToolbar';
import { Box, Layers, Minus, Plus } from 'lucide-react';

interface ContainerConfigBarProps {
  containerId: string;
  containerName: string;
  containerType: 'docker' | 'kubernetes' | 'custom';
  currentWidth: number;
  currentHeight: number;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  suggestedWidth: number;
  suggestedHeight: number;
  onResize: (id: string, width: number, height: number) => void;
  onClose: () => void;
  onNameChange?: (id: string, name: string) => void;
  onColorChange?: (id: string, color: string) => void;
}

const containerColors = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Purple', value: '#8b5cf6' },
];

export const ContainerConfigBar: React.FC<ContainerConfigBarProps> = ({
  containerId,
  containerName,
  containerType,
  currentWidth,
  currentHeight,
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
  suggestedWidth,
  suggestedHeight,
  onResize,
  onClose,
  onNameChange,
  onColorChange
}) => {
  const [editingName, setEditingName] = useState(false);
  const [localName, setLocalName] = useState(containerName);
  const [inputWidth, setInputWidth] = useState(Math.round(currentWidth).toString());
  const [inputHeight, setInputHeight] = useState(Math.round(currentHeight).toString());

  // Update input values only when props change (not during user input)
  const [lastCurrentWidth, setLastCurrentWidth] = useState(currentWidth);
  const [lastCurrentHeight, setLastCurrentHeight] = useState(currentHeight);

  if (currentWidth !== lastCurrentWidth) {
    setInputWidth(Math.round(currentWidth).toString());
    setLastCurrentWidth(currentWidth);
  }

  if (currentHeight !== lastCurrentHeight) {
    setInputHeight(Math.round(currentHeight).toString());
    setLastCurrentHeight(currentHeight);
  }

  const handleWidthChange = useCallback((value: number) => {
    const newWidth = Math.max(minWidth, Math.min(maxWidth, value));
    onResize(containerId, newWidth, currentHeight);
  }, [containerId, currentHeight, minWidth, maxWidth, onResize]);

  const handleHeightChange = useCallback((value: number) => {
    const newHeight = Math.max(minHeight, Math.min(maxHeight, value));
    onResize(containerId, currentWidth, newHeight);
  }, [containerId, currentWidth, minHeight, maxHeight, onResize]);

  const handleNameSubmit = useCallback(() => {
    if (onNameChange && localName !== containerName) {
      onNameChange(containerId, localName);
    }
    setEditingName(false);
  }, [containerId, localName, containerName, onNameChange]);

  const containerIcon = containerType === 'kubernetes' ? 
    <Layers className="w-4 h-4" /> : 
    <Box className="w-4 h-4" />;

  return (
    <FloatingToolbar
      title={containerType === 'kubernetes' ? 'Kubernetes' : 'Docker'}
      icon={containerIcon}
      iconColor={containerType === 'kubernetes' ? 'text-green-400' : 'text-blue-400'}
      onClose={onClose}
    >
      {/* Container Name */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-slate-400 text-xs">Name:</span>
        {editingName ? (
          <input
            type="text"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
            className="bg-slate-700 border border-slate-600 rounded px-2 py-1 text-slate-200 text-xs w-24 focus:outline-none focus:border-blue-500"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="text-slate-200 text-xs hover:text-blue-400 transition-colors"
          >
            {containerName}
          </button>
        )}
      </div>

      {/* Size presets */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-slate-400 text-xs">Preset:</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            handleWidthChange(minWidth);
            handleHeightChange(minHeight);
          }}
          className="text-xs px-2 py-1 h-6"
        >
          Min
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            handleWidthChange(suggestedWidth);
            handleHeightChange(suggestedHeight);
          }}
          className="text-xs px-2 py-1 h-6"
        >
          Optimal
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            handleWidthChange(maxWidth);
            handleHeightChange(maxHeight);
          }}
          className="text-xs px-2 py-1 h-6"
        >
          Max
        </Button>
      </div>

      {/* Width control */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-slate-400 text-xs">W:</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleWidthChange(currentWidth - 10)}
          className="p-1 h-6 w-6"
        >
          <Minus className="w-3 h-3" />
        </Button>
        <input
          type="text"
          value={inputWidth}
          onChange={(e) => setInputWidth(e.target.value)}
          onBlur={() => {
            const value = parseInt(inputWidth) || minWidth;
            handleWidthChange(value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const value = parseInt(inputWidth) || minWidth;
              handleWidthChange(value);
            }
          }}
          className="bg-slate-700 border border-slate-600 rounded px-1 py-1 text-slate-200 text-xs w-14 text-center focus:outline-none focus:border-blue-500"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleWidthChange(currentWidth + 10)}
          className="p-1 h-6 w-6"
        >
          <Plus className="w-3 h-3" />
        </Button>
        <span className="text-slate-500 text-xs">px</span>
      </div>

      {/* Height control */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-slate-400 text-xs">H:</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleHeightChange(currentHeight - 10)}
          className="p-1 h-6 w-6"
        >
          <Minus className="w-3 h-3" />
        </Button>
        <input
          type="text"
          value={inputHeight}
          onChange={(e) => setInputHeight(e.target.value)}
          onBlur={() => {
            const value = parseInt(inputHeight) || minHeight;
            handleHeightChange(value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const value = parseInt(inputHeight) || minHeight;
              handleHeightChange(value);
            }
          }}
          className="bg-slate-700 border border-slate-600 rounded px-1 py-1 text-slate-200 text-xs w-14 text-center focus:outline-none focus:border-blue-500"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleHeightChange(currentHeight + 10)}
          className="p-1 h-6 w-6"
        >
          <Plus className="w-3 h-3" />
        </Button>
        <span className="text-slate-500 text-xs">px</span>
      </div>

      {/* Color selector */}
      {onColorChange && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-slate-400 text-xs">Color:</span>
          <div className="flex gap-1">
            {containerColors.map((color) => (
              <button
                key={color.value}
                onClick={() => onColorChange(containerId, color.value)}
                className={cn(
                  "w-6 h-6 rounded border transition-all",
                  "border-slate-600 hover:border-slate-500"
                )}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Current/Suggested display */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <span className="text-slate-500 text-xs">
          Current: {Math.round(currentWidth)}×{Math.round(currentHeight)}
        </span>
        <span className="text-green-400 text-xs">
          Suggested: {suggestedWidth}×{suggestedHeight}
        </span>
      </div>
    </FloatingToolbar>
  );
};