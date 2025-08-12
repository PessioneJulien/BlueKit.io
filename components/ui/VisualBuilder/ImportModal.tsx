'use client';

import React, { useState, useCallback, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileJson, 
  AlertCircle, 
  CheckCircle,
  ChevronRight,
  Loader2,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { NodeData } from './CanvasNode';
import { Connection } from './ConnectionLine';
import { motion, AnimatePresence } from 'framer-motion';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (stackData: ImportedStackData) => void;
}

interface ImportedStackData {
  name: string;
  description: string;
  nodes: Array<NodeData & {
    position: { x: number; y: number };
    width?: number;
    height?: number;
    documentation?: string;
  }>;
  connections: Connection[];
}

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

type ImportState = 'idle' | 'validating' | 'preview' | 'success' | 'error';

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const [importState, setImportState] = useState<ImportState>('idle');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [parsedData, setParsedData] = useState<ImportedStackData | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation schema pour le format JSON
  const validateStackStructure = useCallback((data: unknown): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    // Type guard pour s'assurer que data est un object
    if (!data || typeof data !== 'object') {
      errors.push({
        field: 'root',
        message: 'Invalid data format',
        severity: 'error'
      });
      return errors;
    }

    const stackData = data as Record<string, unknown>;

    // Validation des champs obligatoires
    if (!stackData.name || typeof stackData.name !== 'string') {
      errors.push({
        field: 'name',
        message: 'Stack name is required and must be a string',
        severity: 'error'
      });
    }

    if (!stackData.description) {
      errors.push({
        field: 'description',
        message: 'Stack description is recommended',
        severity: 'warning'
      });
    }

    // Validation des technologies/nodes
    if (!stackData.technologies && !stackData.nodes) {
      errors.push({
        field: 'technologies',
        message: 'Stack must contain at least one technology or node',
        severity: 'error'
      });
    }

    const techs = stackData.technologies || stackData.nodes || [];
    if (!Array.isArray(techs)) {
      errors.push({
        field: 'technologies',
        message: 'Technologies must be an array',
        severity: 'error'
      });
    } else {
      techs.forEach((tech: unknown, index: number) => {
        const techData = tech as Record<string, unknown>;
        if (!techData.id) {
          errors.push({
            field: `technologies[${index}].id`,
            message: `Technology at index ${index} must have an ID`,
            severity: 'error'
          });
        }

        if (!techData.name) {
          errors.push({
            field: `technologies[${index}].name`,
            message: `Technology at index ${index} must have a name`,
            severity: 'error'
          });
        }

        if (!techData.category) {
          errors.push({
            field: `technologies[${index}].category`,
            message: `Technology "${techData.name || index}" should have a category`,
            severity: 'warning'
          });
        }

        // Validation des positions
        if (!techData.position) {
          errors.push({
            field: `technologies[${index}].position`,
            message: `Technology "${techData.name || index}" missing position, will be auto-positioned`,
            severity: 'warning'
          });
        } else {
          const position = techData.position as Record<string, unknown>;
          if (!position.x || !position.y) {
            errors.push({
              field: `technologies[${index}].position`,
              message: `Technology "${techData.name || index}" has invalid position coordinates`,
              severity: 'warning'
            });
          }
        }
      });
    }

    // Validation des connections
    if (stackData.connections && Array.isArray(stackData.connections)) {
      stackData.connections.forEach((conn: unknown, index: number) => {
        const connData = conn as Record<string, unknown>;
        if (!connData.source && !connData.sourceNodeId) {
          errors.push({
            field: `connections[${index}].source`,
            message: `Connection at index ${index} missing source`,
            severity: 'error'
          });
        }

        if (!connData.target && !connData.targetNodeId) {
          errors.push({
            field: `connections[${index}].target`,
            message: `Connection at index ${index} missing target`,
            severity: 'error'
          });
        }
      });
    }

    return errors;
  }, []);

  // Conversion du format JSON vers le format interne
  const convertToInternalFormat = useCallback((data: unknown): ImportedStackData => {
    const stackData = data as Record<string, unknown>;
    const technologies = stackData.technologies || stackData.nodes || [];
    
    // Conversion des technologies vers le format CanvasNode
    const nodes = (technologies as unknown[]).map((tech: unknown, index: number) => {
      const techData = tech as Record<string, unknown>;
      const baseNode: NodeData & {
        position: { x: number; y: number };
        width?: number;
        height?: number;
        documentation?: string;
      } = {
        id: (techData.id as string) || `imported-${index}-${Date.now()}`,
        name: (techData.name as string) || `Technology ${index + 1}`,
        category: (techData.category as string) || 'other',
        description: (techData.description as string) || '',
        setupTimeHours: (techData.setupTimeHours as number) || (techData.setupTime as number) || 1,
        difficulty: (techData.difficulty as 'beginner' | 'intermediate' | 'expert') || 'beginner',
        pricing: (techData.pricing as 'free' | 'freemium' | 'paid') || 'free',
        isMainTechnology: techData.isMainTechnology !== false, // Default to true
        position: (techData.position as { x: number; y: number }) || {
          x: 100 + (index % 4) * 250,
          y: 100 + Math.floor(index / 4) * 150
        },
        width: ((techData.size as Record<string, unknown>)?.width as number) || (techData.width as number) || 200,
        height: ((techData.size as Record<string, unknown>)?.height as number) || (techData.height as number) || 80,
        documentation: (techData.documentation as string) || '',
        subTechnologies: (techData.subTechnologies as unknown[]) || [],
        compatibleWith: (techData.compatibleWith as string[]) || [],
        incompatibleWith: (techData.incompatibleWith as string[]) || []
      };

      return baseNode;
    });

    // Conversion des connections
    const connections = ((stackData.connections as unknown[]) || []).map((conn: unknown, index: number) => {
      const connData = conn as Record<string, unknown>;
      return {
        id: (connData.id as string) || `conn-${index}-${Date.now()}`,
        sourceNodeId: (connData.source as string) || (connData.sourceNodeId as string),
        targetNodeId: (connData.target as string) || (connData.targetNodeId as string),
        type: (connData.type as string) || 'default',
        style: (connData.style as Record<string, unknown>) || {}
      };
    });

    return {
      name: (stackData.name as string) || 'Imported Stack',
      description: (stackData.description as string) || 'Imported from JSON file',
      nodes,
      connections
    };
  }, []);

  // Traitement du fichier uploadé
  const processFile = useCallback(async (file: File) => {
    setImportState('validating');
    setValidationErrors([]);
    setParsedData(null);

    try {
      const content = await file.text();

      // Parse JSON
      let jsonData;
      try {
        jsonData = JSON.parse(content);
      } catch {
        setValidationErrors([{
          field: 'json',
          message: 'Invalid JSON format. Please check your file syntax.',
          severity: 'error'
        }]);
        setImportState('error');
        return;
      }

      // Validation de la structure
      const errors = validateStackStructure(jsonData);
      setValidationErrors(errors);

      const hasErrors = errors.some(error => error.severity === 'error');
      if (hasErrors) {
        setImportState('error');
        return;
      }

      // Conversion vers format interne
      const convertedData = convertToInternalFormat(jsonData);
      setParsedData(convertedData);
      setImportState('preview');

    } catch (error) {
      console.error('Failed to process file:', error);
      setValidationErrors([{
        field: 'processing',
        message: 'Failed to process the file. Please try again.',
        severity: 'error'
      }]);
      setImportState('error');
    }
  }, [validateStackStructure, convertToInternalFormat]);

  // Gestion du drag & drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const jsonFile = files.find(file => 
      file.type === 'application/json' || file.name.endsWith('.json')
    );

    if (jsonFile) {
      setUploadedFile(jsonFile);
      processFile(jsonFile);
    } else {
      setValidationErrors([{
        field: 'file',
        message: 'Please select a valid JSON file',
        severity: 'error'
      }]);
      setImportState('error');
    }
  }, [processFile]);

  // Gestion du file input
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      processFile(file);
    }
  }, [processFile]);

  // Import final
  const handleImport = useCallback(() => {
    if (parsedData) {
      setImportState('success');
      setTimeout(() => {
        onImportSuccess(parsedData);
        onClose();
        // Reset state
        setImportState('idle');
        setUploadedFile(null);
        setParsedData(null);
        setValidationErrors([]);
      }, 1000);
    }
  }, [parsedData, onImportSuccess, onClose]);

  // Reset state on close
  const handleClose = useCallback(() => {
    setImportState('idle');
    setUploadedFile(null);
    setParsedData(null);
    setValidationErrors([]);
    setDragActive(false);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  const errorCount = validationErrors.filter(e => e.severity === 'error').length;
  const warningCount = validationErrors.filter(e => e.severity === 'warning').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
              <Upload className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">
                Import Stack Configuration
              </h2>
              <p className="text-sm text-slate-400">
                Import your stack from JSON file
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* Upload State */}
            {importState === 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-8"
              >
                <div
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer",
                    dragActive 
                      ? "border-blue-400 bg-blue-500/10" 
                      : "border-slate-600 hover:border-slate-500 hover:bg-slate-800/20"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full">
                      <FileJson className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-white mb-1">
                        Drop your JSON file here
                      </p>
                      <p className="text-sm text-slate-400">
                        or click to browse files
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Validating State */}
            {importState === 'validating' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-12"
              >
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                  <div>
                    <p className="text-lg font-medium text-white mb-1">
                      Validating your stack...
                    </p>
                    <p className="text-sm text-slate-400">
                      Checking structure and compatibility
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error State */}
            {importState === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-start gap-3 mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-red-400 mb-1">
                      Import Failed
                    </h3>
                    <p className="text-sm text-red-300">
                      {errorCount} error{errorCount !== 1 ? 's' : ''} found in your stack configuration
                    </p>
                  </div>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {validationErrors.map((error, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border",
                        error.severity === 'error'
                          ? "bg-red-500/5 border-red-500/20"
                          : "bg-yellow-500/5 border-yellow-500/20"
                      )}
                    >
                      <AlertCircle className={cn(
                        "w-4 h-4 mt-0.5",
                        error.severity === 'error' ? "text-red-400" : "text-yellow-400"
                      )} />
                      <div>
                        <p className="text-sm font-medium text-white">
                          {error.field}
                        </p>
                        <p className="text-sm text-slate-400">
                          {error.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center mt-6">
                  <Button
                    variant="ghost"
                    onClick={() => setImportState('idle')}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Try Another File
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Preview State */}
            {importState === 'preview' && parsedData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex items-center gap-3 mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <h3 className="font-medium text-green-400 mb-1">
                      Stack Ready for Import
                    </h3>
                    <p className="text-sm text-green-300">
                      {warningCount > 0 && `${warningCount} warning${warningCount !== 1 ? 's' : ''} found, but stack is importable`}
                      {warningCount === 0 && 'No issues found, ready to import'}
                    </p>
                  </div>
                </div>

                {/* Stack Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-2">Stack Details</h4>
                      <div className="bg-slate-800/50 rounded-lg p-4 space-y-3">
                        <div>
                          <span className="text-xs text-slate-400">Name:</span>
                          <p className="text-sm text-white font-medium">{parsedData.name}</p>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400">Description:</span>
                          <p className="text-sm text-slate-300">{parsedData.description || 'No description'}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-slate-300 mb-2">Components</h4>
                      <div className="bg-slate-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Technologies:</span>
                          <span className="text-white font-medium">{parsedData.nodes.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2">
                          <span className="text-slate-400">Connections:</span>
                          <span className="text-white font-medium">{parsedData.connections.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Technologies Preview</h4>
                    <div className="bg-slate-800/50 rounded-lg p-4 max-h-40 overflow-y-auto">
                      <div className="space-y-2">
                        {parsedData.nodes.slice(0, 8).map(node => (
                          <div key={node.id} className="flex items-center gap-3 p-2 bg-slate-700/30 rounded text-sm">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              node.category === 'frontend' ? "bg-blue-400" :
                              node.category === 'backend' ? "bg-green-400" :
                              node.category === 'database' ? "bg-purple-400" :
                              "bg-slate-400"
                            )} />
                            <span className="text-white font-medium">{node.name}</span>
                            <span className="text-slate-400 capitalize">({node.category})</span>
                          </div>
                        ))}
                        {parsedData.nodes.length > 8 && (
                          <p className="text-xs text-slate-400 text-center pt-2">
                            +{parsedData.nodes.length - 8} more technologies
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warnings */}
                {warningCount > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-slate-300 mb-3">Warnings</h4>
                    <div className="space-y-2 max-h-28 overflow-y-auto">
                      {validationErrors.filter(e => e.severity === 'warning').map((warning, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-yellow-400">{warning.field}</p>
                            <p className="text-sm text-yellow-300">{warning.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Success State */}
            {importState === 'success' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-white mb-1">
                      Import Successful!
                    </p>
                    <p className="text-sm text-slate-400">
                      Your stack has been imported to the canvas
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        {(importState === 'preview' || importState === 'error') && (
          <div className="flex items-center justify-between p-6 border-t border-slate-700/50 bg-slate-900/50">
            <Button
              variant="ghost"
              onClick={() => setImportState('idle')}
              className="flex items-center gap-2"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back
            </Button>

            {importState === 'preview' && (
              <Button
                variant="primary"
                onClick={handleImport}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Download className="w-4 h-4" />
                Import Stack
              </Button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};