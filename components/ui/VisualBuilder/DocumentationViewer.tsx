'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  X, 
  FileText, 
  Copy,
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface DocumentationViewerProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId: string;
  nodeName: string;
  documentation: string;
  isSubTechnology?: boolean;
  parentTechnologyName?: string;
  className?: string;
}

export const DocumentationViewer: React.FC<DocumentationViewerProps> = ({
  isOpen,
  onClose,
  nodeId,
  nodeName,
  documentation,
  isSubTechnology = false,
  parentTechnologyName,
  className
}) => {
  const [copied, setCopied] = useState(false);

  console.log('DocumentationViewer render:', {
    isOpen,
    nodeId,
    nodeName,
    hasDocumentation: !!documentation,
    documentationLength: documentation?.length
  });

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(documentation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy documentation:', error);
    }
  };

  // Simple markdown-like rendering
  const renderDocumentation = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        // Headers
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-lg font-bold text-slate-100 mt-4 mb-2">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-base font-semibold text-slate-200 mt-3 mb-2">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-sm font-medium text-slate-300 mt-2 mb-1">{line.slice(4)}</h3>;
        }
        
        // Code blocks (simple detection)
        if (line.startsWith('```')) {
          return <div key={index} className="bg-slate-900 border border-slate-700 rounded p-2 font-mono text-xs text-slate-300 mt-2 mb-2">Code block</div>;
        }
        
        // Lists
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return <li key={index} className="text-sm text-slate-300 ml-4">{line.slice(2)}</li>;
        }
        
        // Links (simple detection)
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        if (linkRegex.test(line)) {
          const processedLine = line.replace(linkRegex, (match, text, url) => {
            return `<a href="${url}" target="_blank" class="text-blue-400 hover:text-blue-300 underline">${text}</a>`;
          });
          return <p key={index} className="text-sm text-slate-300 mb-2" dangerouslySetInnerHTML={{ __html: processedLine }} />;
        }
        
        // Regular paragraphs
        if (line.trim()) {
          return <p key={index} className="text-sm text-slate-300 mb-2">{line}</p>;
        }
        
        // Empty lines
        return <br key={index} />;
      });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card 
        variant="glass" 
        className={`relative z-10 w-full max-w-2xl max-h-[80vh] border-slate-600 ${className}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                <CardTitle className="text-base">
                  {nodeName} Documentation
                </CardTitle>
              </div>
              
              {isSubTechnology && (
                <Badge variant="secondary" size="sm" className="text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  Tool of {parentTechnologyName}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="text-xs px-2 py-1 h-7"
                title="Copy documentation"
              >
                <Copy className="w-3 h-3 mr-1" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-1 h-7 w-7"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="overflow-y-auto max-h-[60vh]">
          {documentation ? (
            <div className="prose prose-invert prose-sm max-w-none">
              {renderDocumentation(documentation)}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-slate-500 mb-3" />
              <p className="text-slate-400 text-sm">
                No documentation available for this component.
              </p>
            </div>
          )}
        </CardContent>
        
        {/* Footer */}
        <div className="border-t border-slate-700 px-6 py-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Documentation for {nodeName}</span>
            <span>{documentation ? `${documentation.length} characters` : 'Empty'}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};