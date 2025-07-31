'use client';

import { useState, useEffect } from 'react';
import { X, Save, Edit3, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId: string;
  nodeName: string;
  initialDocumentation?: string;
  onSave: (nodeId: string, documentation: string) => void;
  isSubTechnology?: boolean;
  parentTechnologyName?: string;
}

export const DocumentationModal: React.FC<DocumentationModalProps> = ({
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

  useEffect(() => {
    setDocumentation(initialDocumentation);
    setIsEditing(!initialDocumentation);
  }, [initialDocumentation, nodeId]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(nodeId, documentation);
    setIsEditing(false);
  };

  const renderMarkdown = (text: string) => {
    // Simple markdown parser for preview
    return text
      .split('\n')
      .map((line, index) => {
        // Headers
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-semibold mt-4 mb-2">{line.slice(4)}</h3>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-bold mt-4 mb-2">{line.slice(3)}</h2>;
        }
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold mt-4 mb-2">{line.slice(2)}</h1>;
        }
        
        // Code blocks
        if (line.startsWith('```')) {
          return <div key={index} className="bg-slate-800 p-3 rounded-md font-mono text-sm my-2">{line.slice(3)}</div>;
        }
        
        // Lists
        if (line.startsWith('- ')) {
          return <li key={index} className="ml-4 list-disc">{line.slice(2)}</li>;
        }
        
        // Regular paragraphs
        if (line.trim()) {
          return <p key={index} className="mb-2">{line}</p>;
        }
        
        return <br key={index} />;
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Documentation: {nodeName}
            </h2>
            {isSubTechnology && parentTechnologyName && (
              <p className="text-sm text-slate-400 mt-1">
                Setup guide for {nodeName} in {parentTechnologyName}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isEditing ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-300">
                  Write your documentation (Markdown supported)
                </label>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  {showPreview ? 'Hide' : 'Show'} Preview
                </button>
              </div>
              
              <div className={cn("grid gap-4", showPreview && "grid-cols-2")}>
                <div>
                  <textarea
                    value={documentation}
                    onChange={(e) => setDocumentation(e.target.value)}
                    placeholder={`Write documentation for ${nodeName}...\n\nExample:\n# ${nodeName} Setup\n\n## Installation\n\`\`\`bash\nnpm install ${nodeName.toLowerCase()}\n\`\`\`\n\n## Configuration\n- Step 1: ...\n- Step 2: ...\n\n## Best Practices\n...`}
                    className="w-full h-[500px] bg-slate-800 border border-slate-700 rounded-lg p-4 text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>
                
                {showPreview && (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 h-[500px] overflow-y-auto">
                    <div className="prose prose-invert prose-sm max-w-none">
                      {renderMarkdown(documentation)}
                    </div>
                  </div>
                )}
              </div>

              {isSubTechnology && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <p className="text-sm text-blue-300">
                    💡 Tip: Document how to integrate {nodeName} specifically with {parentTechnologyName}, 
                    including any special configurations or considerations.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="prose prose-invert max-w-none">
                {documentation ? (
                  renderMarkdown(documentation)
                ) : (
                  <p className="text-slate-400 italic">No documentation yet. Click Edit to add some.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-700">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  setDocumentation(initialDocumentation);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Documentation
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Documentation
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};