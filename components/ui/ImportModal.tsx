import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Upload, X, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (stackData: ImportedStack) => void;
}

interface ImportedStackNode {
  id: string;
  name: string;
  category: string;
  position: { x: number; y: number };
}

interface ImportedConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
}

interface ImportedStack {
  name: string;
  description?: string;
  nodes: ImportedStackNode[];
  connections: ImportedConnection[];
}

interface StackPreview {
  name: string;
  description: string;
  nodeCount: number;
  connectionCount: number;
  categories: string[];
  isValid: boolean;
  error?: string;
}

export function ImportModal({ isOpen, onClose, onImport }: ImportModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [stackPreview, setStackPreview] = useState<StackPreview | null>(null);
  const [jsonData, setJsonData] = useState<ImportedStack | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const validateStackData = (data: ImportedStack): StackPreview => {
    try {
      // Check required fields
      if (!data.name || typeof data.name !== 'string') {
        return { 
          name: '', 
          description: '', 
          nodeCount: 0, 
          connectionCount: 0, 
          categories: [], 
          isValid: false, 
          error: 'Missing or invalid stack name' 
        };
      }

      if (!Array.isArray(data.nodes)) {
        return { 
          name: data.name, 
          description: data.description || '', 
          nodeCount: 0, 
          connectionCount: 0, 
          categories: [], 
          isValid: false, 
          error: 'Missing or invalid nodes array' 
        };
      }

      if (!Array.isArray(data.connections)) {
        return { 
          name: data.name, 
          description: data.description || '', 
          nodeCount: data.nodes.length, 
          connectionCount: 0, 
          categories: [], 
          isValid: false, 
          error: 'Missing or invalid connections array' 
        };
      }

      // Validate node structure
      for (const node of data.nodes) {
        if (!node.id || !node.name || !node.category) {
          return { 
            name: data.name, 
            description: data.description || '', 
            nodeCount: data.nodes.length, 
            connectionCount: data.connections.length, 
            categories: [], 
            isValid: false, 
            error: 'Invalid node structure - missing id, name, or category' 
          };
        }

        if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
          return { 
            name: data.name, 
            description: data.description || '', 
            nodeCount: data.nodes.length, 
            connectionCount: data.connections.length, 
            categories: [], 
            isValid: false, 
            error: 'Invalid node position data' 
          };
        }
      }

      // Validate connection structure
      for (const connection of data.connections) {
        if (!connection.id || !connection.sourceNodeId || !connection.targetNodeId) {
          return { 
            name: data.name, 
            description: data.description || '', 
            nodeCount: data.nodes.length, 
            connectionCount: data.connections.length, 
            categories: [], 
            isValid: false, 
            error: 'Invalid connection structure' 
          };
        }
      }

      // Extract categories
      const categories = Array.from(new Set(data.nodes.map((node: { category: string }) => node.category)));

      return {
        name: data.name,
        description: data.description || '',
        nodeCount: data.nodes.length,
        connectionCount: data.connections.length,
        categories,
        isValid: true
      };
    } catch (error) {
      return { 
        name: '', 
        description: '', 
        nodeCount: 0, 
        connectionCount: 0, 
        categories: [], 
        isValid: false, 
        error: 'Invalid JSON format' 
      };
    }
  };

  const handleFileRead = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonContent = e.target?.result as string;
        const parsedData = JSON.parse(jsonContent);
        setJsonData(parsedData);
        setStackPreview(validateStackData(parsedData));
      } catch (error) {
        setStackPreview({ 
          name: '', 
          description: '', 
          nodeCount: 0, 
          connectionCount: 0, 
          categories: [], 
          isValid: false, 
          error: 'Invalid JSON file' 
        });
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const jsonFile = files.find(file => 
      file.type === 'application/json' || 
      file.name.toLowerCase().endsWith('.json')
    );
    
    if (jsonFile) {
      handleFileRead(jsonFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileRead(file);
    }
  };

  const handleImport = () => {
    if (jsonData && stackPreview?.isValid) {
      onImport(jsonData);
      onClose();
      resetModal();
    }
  };

  const resetModal = () => {
    setStackPreview(null);
    setJsonData(null);
    setDragActive(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <Card className="relative w-full max-w-2xl mx-4 bg-slate-900 border-slate-700 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-400" />
              Import Stack
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* File Upload Area */}
          {!stackPreview && (
            <div
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-colors
                ${dragActive 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-slate-600 hover:border-slate-500'
                }
              `}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
            >
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Import Stack from JSON
              </h3>
              <p className="text-slate-400 mb-4">
                Drag and drop your JSON file here, or click to browse
              </p>
              <Button
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileText className="w-4 h-4 mr-2" />
                Select JSON File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          {/* Preview Area */}
          {stackPreview && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                {stackPreview.isValid ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-medium">Valid Stack File</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 font-medium">Invalid Stack File</span>
                  </>
                )}
              </div>

              {stackPreview.isValid ? (
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                  <h3 className="font-semibold text-white text-lg mb-2">
                    {stackPreview.name}
                  </h3>
                  {stackPreview.description && (
                    <p className="text-slate-300 mb-4">
                      {stackPreview.description}
                    </p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {stackPreview.nodeCount}
                      </div>
                      <div className="text-sm text-slate-400">Components</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {stackPreview.connectionCount}
                      </div>
                      <div className="text-sm text-slate-400">Connections</div>
                    </div>
                  </div>

                  {stackPreview.categories.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-2">
                        Categories
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {stackPreview.categories.map(category => (
                          <Badge key={category} variant="outline" size="sm">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <h4 className="font-medium text-red-300">Import Error</h4>
                  </div>
                  <p className="text-red-200 text-sm">
                    {stackPreview.error}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={resetModal}
                  className="flex-1"
                >
                  Choose Different File
                </Button>
                <Button
                  variant="primary"
                  onClick={handleImport}
                  disabled={!stackPreview.isValid}
                  className="flex-1"
                >
                  Import Stack
                </Button>
              </div>
            </div>
          )}

          {/* Format Information */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <h4 className="font-medium text-blue-300 mb-2">Expected Format</h4>
            <p className="text-blue-200 text-sm">
              The JSON file should contain a stack exported from BlueKit.io with the following structure:
            </p>
            <pre className="text-xs text-blue-200 mt-2 bg-blue-500/5 p-2 rounded overflow-x-auto">
{`{
  "name": "Stack Name",
  "description": "Stack Description",
  "nodes": [...],
  "connections": [...]
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}