'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Maximize2, Minimize2, Edit3, Eye, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface FloatingDocPanelProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId: string;
  nodeName: string;
  initialDocumentation?: string;
  onSave: (nodeId: string, documentation: string) => void;
  isSubTechnology?: boolean;
  parentTechnologyName?: string;
}

export const FloatingDocPanel: React.FC<FloatingDocPanelProps> = ({
  isOpen,
  onClose,
  nodeId,
  nodeName,
  initialDocumentation = '',
  onSave,
  isSubTechnology = false,
  parentTechnologyName
}) => {
  const [documentation, setDocumentation] = useState(initialDocumentation);
  const [isEditing, setIsEditing] = useState(!initialDocumentation);
  const [showPreview, setShowPreview] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 600, height: 400 });
  
  const panelRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setDocumentation(initialDocumentation);
    setIsEditing(!initialDocumentation);
  }, [initialDocumentation, nodeId]);

  const handleSave = () => {
    onSave(nodeId, documentation);
    setIsEditing(false);
  };

  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-white">{line.slice(4)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-bold mt-4 mb-2 text-white">{line.slice(3)}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold mt-4 mb-2 text-white">{line.slice(2)}</h1>;
        }
        if (line.startsWith('```')) {
          return <div key={index} className="bg-slate-800 p-3 rounded-md font-mono text-sm my-2 text-slate-300">{line.slice(3)}</div>;
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="ml-4 list-disc text-slate-300">{line.slice(2)}</li>;
        }
        if (line.trim()) {
          return <p key={index} className="mb-2 text-slate-300">{line}</p>;
        }
        return <br key={index} />;
      });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as Element).classList.contains('drag-handle')) {
      isDragging.current = true;
      dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging.current) {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y
      });
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    isResizing.current = false;
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const panelStyle = isMaximized 
    ? { top: 0, left: 0, width: '100vw', height: '100vh' }
    : { 
        top: position.y, 
        left: position.x, 
        width: size.width, 
        height: size.height 
      };

  return (
    <div
      ref={panelRef}
      className={cn(
        "fixed bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 flex flex-col",
        isMaximized && "rounded-none"
      )}
      style={panelStyle}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseMove={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-3 border-b border-slate-700 bg-slate-800 rounded-t-lg cursor-move drag-handle"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <div className="ml-2">
            <h3 className="text-sm font-semibold text-white">
              📝 {nodeName} Documentation
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 h-6 w-6"
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 h-6 w-6"
            title="Close"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {isEditing ? (
          <div className="flex-1 flex flex-col p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Button
                  variant={showPreview ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  Preview
                </Button>
                <span className="text-xs text-slate-400">
                  Markdown supported
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDocumentation(initialDocumentation);
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSave}
                  className="flex items-center gap-1"
                >
                  <Save className="w-3 h-3" />
                  Save
                </Button>
              </div>
            </div>
            
            <div className={cn("flex-1 grid gap-3", showPreview && "grid-cols-2")}>
              <div className="flex flex-col">
                <textarea
                  value={documentation}
                  onChange={(e) => setDocumentation(e.target.value)}
                  placeholder={`Write documentation for ${nodeName}...\n\nExample:\n# ${nodeName} Setup\n\n## Installation\n\`\`\`bash\nnpm install ${nodeName.toLowerCase()}\n\`\`\`\n\n## Configuration\n- Step 1: ...\n- Step 2: ...`}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
              
              {showPreview && (
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 overflow-y-auto">
                  <div className="prose prose-invert prose-sm max-w-none">
                    {renderMarkdown(documentation)}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h4 className="text-sm font-medium text-slate-300">Documentation</h4>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" />
                Edit
              </Button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="prose prose-invert prose-sm max-w-none">
                {documentation ? (
                  renderMarkdown(documentation)
                ) : (
                  <p className="text-slate-400 italic">No documentation yet. Click Edit to add some.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resize handle */}
      {!isMaximized && (
        <div 
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-slate-700 hover:bg-slate-600 transition-colors"
          style={{ borderBottomRightRadius: '0.5rem' }}
          onMouseDown={(e) => {
            e.stopPropagation();
            isResizing.current = true;
            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = size.width;
            const startHeight = size.height;
            
            const handleMouseMove = (e: MouseEvent) => {
              if (isResizing.current) {
                setSize({
                  width: Math.max(400, startWidth + (e.clientX - startX)),
                  height: Math.max(300, startHeight + (e.clientY - startY))
                });
              }
            };
            
            const handleMouseUp = () => {
              isResizing.current = false;
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />
      )}
    </div>
  );
};