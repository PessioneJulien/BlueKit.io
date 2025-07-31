'use client';

import { useState } from 'react';
import { X, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { SubTechnology } from './CanvasNode';

interface AddToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  mainTechnologyId: string;
  mainTechnologyName: string;
  availableTools: SubTechnology[];
  currentTools: SubTechnology[];
  acceptedTypes: string[];
  onAddTool: (mainTechId: string, toolId: string) => void;
}

const toolTypeIcons: Record<string, string> = {
  styling: '🎨',
  testing: '🧪',
  documentation: '📚',
  'state-management': '📊',
  routing: '🗺️',
  'build-tool': '🔨',
  linting: '✅',
  deployment: '🚀',
  'ui-ux': '🎨',
  other: '🔧'
};

export const AddToolModal: React.FC<AddToolModalProps> = ({
  isOpen,
  onClose,
  mainTechnologyId,
  mainTechnologyName,
  availableTools,
  currentTools,
  acceptedTypes,
  onAddTool
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter tools that are compatible and not already added
  const compatibleTools = availableTools.filter(tool => 
    acceptedTypes.includes(tool.type) &&
    !currentTools.some(ct => ct.id === tool.id)
  );

  // Apply search and type filters
  const filteredTools = compatibleTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || tool.type === selectedType;
    return matchesSearch && matchesType;
  });

  // Get unique types for filter buttons
  const availableTypes = [...new Set(compatibleTools.map(t => t.type))];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Add Tools to {mainTechnologyName}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Select tools to integrate with {mainTechnologyName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Search and filters */}
        <div className="p-4 border-b border-slate-700 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-slate-400">Filter by type:</span>
            <button
              onClick={() => setSelectedType(null)}
              className={cn(
                "px-3 py-1 rounded-full text-sm transition-colors",
                !selectedType 
                  ? "bg-blue-500 text-white" 
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              )}
            >
              All
            </button>
            {availableTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={cn(
                  "px-3 py-1 rounded-full text-sm transition-colors flex items-center gap-1",
                  selectedType === type 
                    ? "bg-blue-500 text-white" 
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                )}
              >
                <span>{toolTypeIcons[type] || '🔧'}</span>
                {type.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Tools list */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-240px)]">
          {filteredTools.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              {searchQuery || selectedType 
                ? "No tools found matching your criteria" 
                : "No compatible tools available"}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTools.map(tool => (
                <div
                  key={tool.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{toolTypeIcons[tool.type] || '🔧'}</span>
                        <h3 className="font-medium text-white">{tool.name}</h3>
                        <Badge
                          variant={tool.pricing === 'free' ? 'success' : tool.pricing === 'freemium' ? 'warning' : 'danger'}
                          size="sm"
                        >
                          {tool.pricing}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-300 mb-2">{tool.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>Setup: {tool.setupTimeHours}h</span>
                        <span>Difficulty: {tool.difficulty}</span>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        onAddTool(mainTechnologyId, tool.id);
                        onClose();
                      }}
                      className="ml-4 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-700">
          <p className="text-sm text-slate-400">
            {currentTools.length} tool{currentTools.length !== 1 ? 's' : ''} already integrated
          </p>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};