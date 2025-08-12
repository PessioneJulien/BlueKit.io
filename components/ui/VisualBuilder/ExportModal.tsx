'use client';

import React, { useState, useCallback } from 'react';
import { X, Download, FileJson, FileText, FileCode, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { NodeData } from './CanvasNode';
import { Connection } from './ConnectionLine';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  stackName: string;
  stackDescription: string;
  nodes: Array<NodeData & {
    position: { x: number; y: number };
    width?: number;
    height?: number;
    documentation?: string;
  }>;
  connections: Connection[];
}

type ExportFormat = 'json' | 'readme' | 'docker';

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  stackName,
  stackDescription,
  nodes,
  connections
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');
  const [exportContent, setExportContent] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Generate JSON export
  const generateJSON = useCallback(() => {
    const exportData = {
      name: stackName || 'Untitled Stack',
      description: stackDescription,
      version: '1.0.0',
      created: new Date().toISOString(),
      metadata: {
        totalSetupTime: nodes.reduce((sum, node) => sum + node.setupTimeHours, 0),
        nodeCount: nodes.length,
        connectionCount: connections.length,
        difficulties: {
          beginner: nodes.filter(n => n.difficulty === 'beginner').length,
          intermediate: nodes.filter(n => n.difficulty === 'intermediate').length,
          expert: nodes.filter(n => n.difficulty === 'expert').length
        }
      },
      technologies: nodes.map(node => ({
        id: node.id,
        name: node.name,
        category: node.category,
        description: node.description,
        setupTimeHours: node.setupTimeHours,
        difficulty: node.difficulty,
        pricing: node.pricing,
        position: node.position,
        size: {
          width: node.width || 200,
          height: node.height || 80
        },
        documentation: node.documentation || '',
        isMainTechnology: node.isMainTechnology,
        subTechnologies: node.subTechnologies || [],
        compatibleWith: node.compatibleWith || [],
        incompatibleWith: node.incompatibleWith || []
      })),
      connections: connections.map(conn => ({
        id: conn.id,
        source: conn.sourceNodeId,
        target: conn.targetNodeId,
        type: conn.type
      }))
    };
    
    return JSON.stringify(exportData, null, 2);
  }, [stackName, stackDescription, nodes, connections]);

  // Generate README.md
  const generateReadme = useCallback(() => {
    const setupTime = nodes.reduce((sum, node) => sum + node.setupTimeHours, 0);
    const mainTechs = nodes.filter(n => n.isMainTechnology);
    const tools = nodes.filter(n => !n.isMainTechnology);
    
    let readme = `# ${stackName || 'Technology Stack'}\n\n`;
    readme += `${stackDescription || 'A modern technology stack for building applications.'}\n\n`;
    
    readme += `## 📊 Stack Overview\n\n`;
    readme += `- **Total Setup Time**: ${setupTime} hours\n`;
    readme += `- **Main Technologies**: ${mainTechs.length}\n`;
    readme += `- **Tools & Libraries**: ${tools.length}\n`;
    readme += `- **Total Components**: ${nodes.length}\n\n`;
    
    readme += `## 🛠 Technologies\n\n`;
    readme += `### Main Technologies\n\n`;
    
    mainTechs.forEach(tech => {
      readme += `#### ${tech.name}\n`;
      readme += `- **Category**: ${tech.category}\n`;
      readme += `- **Description**: ${tech.description}\n`;
      readme += `- **Setup Time**: ${tech.setupTimeHours}h\n`;
      readme += `- **Difficulty**: ${tech.difficulty}\n`;
      readme += `- **Pricing**: ${tech.pricing}\n`;
      
      if (tech.subTechnologies && tech.subTechnologies.length > 0) {
        readme += `- **Integrated Tools**:\n`;
        tech.subTechnologies.forEach(subTech => {
          readme += `  - ${subTech.name} (${subTech.type})\n`;
        });
      }
      
      if (tech.documentation) {
        readme += `\n##### Setup Instructions\n\n`;
        readme += tech.documentation + '\n';
      }
      
      readme += '\n';
    });
    
    if (tools.length > 0) {
      readme += `### Additional Tools\n\n`;
      tools.forEach(tool => {
        readme += `- **${tool.name}**: ${tool.description}\n`;
      });
      readme += '\n';
    }
    
    readme += `## 🚀 Getting Started\n\n`;
    readme += `1. Clone this repository\n`;
    readme += `2. Follow the setup instructions for each technology\n`;
    readme += `3. Install dependencies and configure connections\n`;
    readme += `4. Start building!\n\n`;
    
    readme += `## 📝 Architecture\n\n`;
    readme += `This stack uses the following architecture:\n\n`;
    
    // Group by category
    const categories = [...new Set(nodes.map(n => n.category))];
    categories.forEach(category => {
      const categoryNodes = nodes.filter(n => n.category === category);
      readme += `- **${category.charAt(0).toUpperCase() + category.slice(1)}**: ${categoryNodes.map(n => n.name).join(', ')}\n`;
    });
    
    readme += `\n---\n\n`;
    readme += `Generated with [BlueKit.io Stack Builder](https://bluekit.io)\n`;
    
    return readme;
  }, [stackName, stackDescription, nodes]);

  // Generate Docker Compose
  const generateDockerCompose = useCallback(() => {
    let compose = `version: '3.8'\n\n`;
    compose += `services:\n`;
    
    // Frontend services
    const frontendNodes = nodes.filter(n => n.category === 'frontend' && n.isMainTechnology);
    frontendNodes.forEach((node, index) => {
      const serviceName = node.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      compose += `  ${serviceName}:\n`;
      compose += `    build:\n`;
      compose += `      context: ./${serviceName}\n`;
      compose += `      dockerfile: Dockerfile\n`;
      compose += `    ports:\n`;
      compose += `      - "${3000 + index}:3000"\n`;
      compose += `    environment:\n`;
      compose += `      - NODE_ENV=development\n`;
      
      // Add backend connections
      const backendConnections = connections
        .filter(conn => conn.sourceNodeId === node.id)
        .map(conn => nodes.find(n => n.id === conn.targetNodeId))
        .filter(n => n && n.category === 'backend');
      
      if (backendConnections.length > 0) {
        compose += `    depends_on:\n`;
        backendConnections.forEach(backend => {
          if (backend) {
            compose += `      - ${backend.name.toLowerCase().replace(/[^a-z0-9]/g, '')}\n`;
          }
        });
      }
      compose += '\n';
    });
    
    // Backend services
    const backendNodes = nodes.filter(n => n.category === 'backend' && n.isMainTechnology);
    backendNodes.forEach((node, index) => {
      const serviceName = node.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      compose += `  ${serviceName}:\n`;
      compose += `    build:\n`;
      compose += `      context: ./${serviceName}\n`;
      compose += `      dockerfile: Dockerfile\n`;
      compose += `    ports:\n`;
      compose += `      - "${8000 + index}:8000"\n`;
      compose += `    environment:\n`;
      compose += `      - NODE_ENV=development\n`;
      
      // Add database connections
      const dbConnections = connections
        .filter(conn => conn.sourceNodeId === node.id)
        .map(conn => nodes.find(n => n.id === conn.targetNodeId))
        .filter(n => n && n.category === 'database');
      
      if (dbConnections.length > 0) {
        compose += `    depends_on:\n`;
        dbConnections.forEach(db => {
          if (db) {
            compose += `      - ${db.name.toLowerCase().replace(/[^a-z0-9]/g, '')}\n`;
          }
        });
      }
      compose += '\n';
    });
    
    // Database services
    const dbNodes = nodes.filter(n => n.category === 'database' && n.isMainTechnology);
    dbNodes.forEach(node => {
      const serviceName = node.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      compose += `  ${serviceName}:\n`;
      
      if (node.name.toLowerCase().includes('postgres')) {
        compose += `    image: postgres:15-alpine\n`;
        compose += `    environment:\n`;
        compose += `      - POSTGRES_USER=admin\n`;
        compose += `      - POSTGRES_PASSWORD=password\n`;
        compose += `      - POSTGRES_DB=${stackName.toLowerCase().replace(/[^a-z0-9]/g, '')}\n`;
        compose += `    ports:\n`;
        compose += `      - "5432:5432"\n`;
        compose += `    volumes:\n`;
        compose += `      - ${serviceName}_data:/var/lib/postgresql/data\n`;
      } else if (node.name.toLowerCase().includes('mongo')) {
        compose += `    image: mongo:6-jammy\n`;
        compose += `    environment:\n`;
        compose += `      - MONGO_INITDB_ROOT_USERNAME=admin\n`;
        compose += `      - MONGO_INITDB_ROOT_PASSWORD=password\n`;
        compose += `    ports:\n`;
        compose += `      - "27017:27017"\n`;
        compose += `    volumes:\n`;
        compose += `      - ${serviceName}_data:/data/db\n`;
      } else if (node.name.toLowerCase().includes('redis')) {
        compose += `    image: redis:7-alpine\n`;
        compose += `    ports:\n`;
        compose += `      - "6379:6379"\n`;
      }
      compose += '\n';
    });
    
    compose += `volumes:\n`;
    dbNodes.forEach(node => {
      const serviceName = node.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      compose += `  ${serviceName}_data:\n`;
    });
    
    return compose;
  }, [nodes, connections, stackName]);


  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Download file
  const downloadFile = () => {
    const fileExtension = selectedFormat === 'json' ? 'json' : 
                         selectedFormat === 'docker' ? 'yml' : 'md';
    
    // Generate safe filename with fallback
    const generateSafeFileName = () => {
      if (selectedFormat === 'docker') return 'docker-compose';
      if (selectedFormat === 'readme') return 'README';
      
      // For JSON files, use stack name or fallback
      const baseName = stackName && stackName.trim() 
        ? stackName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
        : `stack-export-${new Date().toISOString().slice(0, 10)}`;
      
      return baseName || 'untitled-stack';
    };
    
    const fileName = generateSafeFileName();
    
    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate content when modal opens or format changes
  React.useEffect(() => {
    const generate = () => {
      switch (selectedFormat) {
        case 'json':
          setExportContent(generateJSON());
          break;
        case 'readme':
          setExportContent(generateReadme());
          break;
        case 'docker':
          setExportContent(generateDockerCompose());
          break;
      }
    };

    if (isOpen) {
      generate();
    }
  }, [isOpen, selectedFormat, generateJSON, generateReadme, generateDockerCompose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">
            Export Stack Configuration
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Format Selection */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedFormat('json');
                setExportContent(generateJSON());
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                selectedFormat === 'json' 
                  ? "bg-blue-500 text-white" 
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              )}
            >
              <FileJson className="w-4 h-4" />
              JSON Config
            </button>
            <button
              onClick={() => {
                setSelectedFormat('readme');
                setExportContent(generateReadme());
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                selectedFormat === 'readme' 
                  ? "bg-blue-500 text-white" 
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              )}
            >
              <FileText className="w-4 h-4" />
              README.md
            </button>
            <button
              onClick={() => {
                setSelectedFormat('docker');
                setExportContent(generateDockerCompose());
              }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                selectedFormat === 'docker' 
                  ? "bg-blue-500 text-white" 
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              )}
            >
              <FileCode className="w-4 h-4" />
              Docker Compose
            </button>
          </div>
        </div>

        {/* Content Preview */}
        <div className="p-4 h-[calc(90vh-200px)] overflow-y-auto">
          <pre className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-sm text-slate-300 font-mono whitespace-pre-wrap">
            {exportContent}
          </pre>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-700">
          <Button
            variant="ghost"
            onClick={copyToClipboard}
            className="flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
          <Button
            variant="primary"
            onClick={downloadFile}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download {selectedFormat === 'json' ? 'JSON' : 
                     selectedFormat === 'docker' ? 'Docker Compose' : 'README'}
          </Button>
        </div>
      </div>
    </div>
  );
};