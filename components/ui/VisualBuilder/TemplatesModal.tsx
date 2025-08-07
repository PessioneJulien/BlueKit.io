'use client';

import { useState } from 'react';
import { X, Layers, Zap, Smartphone, Brain, Package, Server } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { stackTemplates, StackTemplate } from '@/lib/data/stackTemplates';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: StackTemplate) => void;
}

const categoryIcons = {
  fullstack: <Layers className="w-5 h-5" />,
  frontend: <Zap className="w-5 h-5" />,
  backend: <Package className="w-5 h-5" />,
  mobile: <Smartphone className="w-5 h-5" />,
  ai: <Brain className="w-5 h-5" />,
  devops: <Server className="w-5 h-5" />
};

const categoryColors = {
  fullstack: 'text-blue-400 bg-blue-500/10',
  frontend: 'text-purple-400 bg-purple-500/10',
  backend: 'text-green-400 bg-green-500/10',
  mobile: 'text-pink-400 bg-pink-500/10',
  ai: 'text-yellow-400 bg-yellow-500/10',
  devops: 'text-orange-400 bg-orange-500/10'
};

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredTemplates = selectedCategory
    ? stackTemplates.filter(t => t.category === selectedCategory)
    : stackTemplates;

  const categories = [...new Set(stackTemplates.map(t => t.category))];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Choose a Template
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Start with a pre-configured technology stack
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Filter by:</span>
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-3 py-1 rounded-full text-sm transition-colors",
                !selectedCategory 
                  ? "bg-blue-500 text-white" 
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              )}
            >
              All
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-3 py-1 rounded-full text-sm transition-colors flex items-center gap-1",
                  selectedCategory === category 
                    ? "bg-blue-500 text-white" 
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                )}
              >
                {categoryIcons[category as keyof typeof categoryIcons]}
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-200px)]">
          <div className="grid gap-4 md:grid-cols-2">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all cursor-pointer group"
                onClick={() => {
                  onSelectTemplate(template);
                  onClose();
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      categoryColors[template.category]
                    )}>
                      {categoryIcons[template.category]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>{template.nodes.length} components</span>
                    <span>{template.connections.length} connections</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Use Template
                  </Button>
                </div>

                {/* Tech Preview */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {template.nodes.slice(0, 4).map(node => (
                    <Badge 
                      key={node.id}
                      variant="default" 
                      size="sm"
                      className="text-xs"
                    >
                      {node.name}
                    </Badge>
                  ))}
                  {template.nodes.length > 4 && (
                    <Badge 
                      variant="default" 
                      size="sm"
                      className="text-xs opacity-60"
                    >
                      +{template.nodes.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-700">
          <p className="text-sm text-slate-400">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
          </p>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};