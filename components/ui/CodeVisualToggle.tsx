'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Code, Eye, Copy, Download } from 'lucide-react';
import { StackVisualPreview } from './StackVisualPreview';

interface CodeVisualToggleProps {
  className?: string;
}

interface CodeFormat {
  id: string;
  name: string;
  filename: string;
  icon: string;
  code: string;
}

const codeFormats: CodeFormat[] = [
  {
    id: 'docker',
    name: 'Docker Compose',
    filename: 'docker-compose.yml',
    icon: '🐳',
    code: `version: '3.8'

services:
  frontend:
    image: node:20-alpine
    container_name: web-app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    resources:
      limits:
        cpus: '1.0'
        memory: 1G

  backend:
    image: node:20
    container_name: api-server
    ports:
      - "8080:8080"
    depends_on:
      - database
    resources:
      limits:
        cpus: '2.0'
        memory: 2G

  database:
    image: postgres:15
    container_name: postgres-db
    environment:
      - POSTGRES_DB=app
      - POSTGRES_PASSWORD=secret
    volumes:
      - pgdata:/var/lib/postgresql/data
    resources:
      limits:
        cpus: '1.0'
        memory: 1G

volumes:
  pgdata:`
  },
  {
    id: 'json',
    name: 'Stack Config',
    filename: 'stack-config.json',
    icon: '📄',
    code: `{
  "name": "Modern SaaS Stack",
  "version": "1.0.0",
  "services": [
    {
      "id": "frontend",
      "name": "Next.js",
      "type": "frontend",
      "image": "node:20-alpine",
      "ports": [3000],
      "resources": {
        "cpu": "1 core",
        "memory": "1GB"
      },
      "tools": ["tailwindcss", "framer-motion"]
    },
    {
      "id": "backend", 
      "name": "Node.js",
      "type": "backend",
      "image": "node:20",
      "ports": [8080],
      "resources": {
        "cpu": "2 cores",
        "memory": "2GB"
      }
    },
    {
      "id": "database",
      "name": "PostgreSQL",
      "type": "database", 
      "image": "postgres:15",
      "ports": [5432],
      "resources": {
        "cpu": "1 core",
        "memory": "1GB"
      }
    }
  ],
  "containers": [
    {
      "name": "web-services",
      "type": "docker",
      "contains": ["frontend", "backend"],
      "resources": {
        "cpu": "3 cores",
        "memory": "4GB"
      }
    }
  ]
}`
  },
  {
    id: 'k8s',
    name: 'Kubernetes',
    filename: 'deployment.yaml',
    icon: '☸️',
    code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: webapp-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: webapp
  template:
    metadata:
      labels:
        app: webapp
    spec:
      containers:
      - name: frontend
        image: node:20-alpine
        ports:
        - containerPort: 3000
        resources:
          limits:
            cpu: "1000m"
            memory: "1Gi"
          requests:
            cpu: "500m"
            memory: "512Mi"
      - name: backend
        image: node:20
        ports:
        - containerPort: 8080
        resources:
          limits:
            cpu: "2000m"
            memory: "2Gi"
          requests:
            cpu: "1000m"
            memory: "1Gi"
---
apiVersion: v1
kind: Service
metadata:
  name: webapp-service
spec:
  selector:
    app: webapp
  ports:
  - name: frontend
    port: 3000
    targetPort: 3000
  - name: backend
    port: 8080
    targetPort: 8080
  type: LoadBalancer`
  }
];

export const CodeVisualToggle = ({ className }: CodeVisualToggleProps) => {
  const [currentView, setCurrentView] = useState<'visual' | 'code'>('visual');
  const [currentCodeIndex, setCurrentCodeIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);

  // Auto-cycle entre visual et code
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentView(prev => {
        if (prev === 'visual') {
          return 'code';
        } else {
          // Change de format de code et retourne au visuel
          setCurrentCodeIndex(prev => (prev + 2) % codeFormats.length);
          return 'visual';
        }
      });
    }, 10000); // Change toutes les 6 secondes pour plus de temps de lecture

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const currentCodeFormat = codeFormats[currentCodeIndex];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(currentCodeFormat.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className={`relative bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden ${className}`}>
      <div className="absolute -inset-px bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur" />
      
      {/* Header avec contrôles */}
      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-4 text-xs text-slate-500">
            {currentView === 'visual' ? 'Visual Builder' : currentCodeFormat.filename}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Indicateurs de format */}
          <div className="flex items-center gap-1">
            {codeFormats.map((format, index) => (
              <button
                key={format.id}
                onClick={() => {
                  setCurrentCodeIndex(index);
                  setCurrentView('code');
                  setIsAutoPlaying(false);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentCodeIndex && currentView === 'code'
                    ? 'bg-blue-400' 
                    : 'bg-slate-600 hover:bg-slate-500'
                }`}
                title={format.name}
              />
            ))}
          </div>
          
          {/* Toggle manual */}
          <button
            onClick={() => {
              setCurrentView(prev => prev === 'visual' ? 'code' : 'visual');
              setIsAutoPlaying(false);
            }}
            className="p-1 rounded bg-slate-700/50 hover:bg-slate-700 transition-colors"
            title={currentView === 'visual' ? 'Show Code' : 'Show Visual'}
          >
            {currentView === 'visual' ? (
              <Code className="w-4 h-4 text-slate-400" />
            ) : (
              <Eye className="w-4 h-4 text-slate-400" />
            )}
          </button>
          
          {/* Auto-play toggle */}
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="p-1 rounded bg-slate-700/50 hover:bg-slate-700 transition-colors"
            title={isAutoPlaying ? 'Pause auto-cycle' : 'Resume auto-cycle'}
          >
            {isAutoPlaying ? (
              <Pause className="w-4 h-4 text-slate-400" />
            ) : (
              <Play className="w-4 h-4 text-slate-400" />
            )}
          </button>
          
          {/* Actions pour le code */}
          {currentView === 'code' && (
            <>
              <button
                onClick={copyToClipboard}
                className="p-1 rounded bg-slate-700/50 hover:bg-slate-700 transition-colors"
                title="Copy code"
              >
                <Copy className={`w-4 h-4 ${copiedCode ? 'text-green-400' : 'text-slate-400'}`} />
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([currentCodeFormat.code], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = currentCodeFormat.filename;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="p-1 rounded bg-slate-700/50 hover:bg-slate-700 transition-colors"
                title="Download file"
              >
                <Download className="w-4 h-4 text-slate-400" />
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Contenu animé */}
      <div className="relative h-[400px]">
        <AnimatePresence mode="wait">
          {currentView === 'visual' ? (
            <motion.div
              key="visual"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <StackVisualPreview className="h-full" />
            </motion.div>
          ) : (
            <motion.div
              key={`code-${currentCodeFormat.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <div className="h-full bg-slate-950/50 rounded-lg p-6 overflow-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl">{currentCodeFormat.icon}</div>
                  <div>
                    <h4 className="text-white font-semibold">{currentCodeFormat.name}</h4>
                    <p className="text-xs text-slate-400">Generated from visual design</p>
                  </div>
                </div>
                
                <pre className="text-sm text-slate-300 font-mono overflow-x-auto leading-relaxed">
                  <code>{currentCodeFormat.code}</code>
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Progress bar pour auto-play */}
      {isAutoPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
          <motion.div
            key={`progress-${currentView}-${currentCodeIndex}`}
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 6, ease: 'linear' }}
          />
        </div>
      )}
    </div>
  );
};