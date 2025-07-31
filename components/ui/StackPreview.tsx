'use client';

import { useMemo } from 'react';
import { Badge } from './Badge';
import { cn } from '@/lib/utils';
import { 
  Globe, Database, Server, Cloud, Smartphone, Brain, 
  Code, Monitor, Layers, Settings, Shield, Zap,
  ArrowRight, ArrowDown, ArrowUpRight
} from 'lucide-react';

interface Technology {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'mobile' | 'ai' | 'other';
  role: 'primary' | 'secondary' | 'optional';
}

interface StackPreviewProps {
  technologies: Technology[];
  className?: string;
  compact?: boolean;
}

const categoryConfig = {
  frontend: {
    colors: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-400/50 text-blue-200',
    shadowColor: 'shadow-blue-500/20',
    icon: Monitor,
    layer: 1,
    label: 'Frontend'
  },
  backend: {
    colors: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-400/50 text-green-200',
    shadowColor: 'shadow-green-500/20',
    icon: Server,
    layer: 2,
    label: 'Backend'
  },
  database: {
    colors: 'bg-gradient-to-br from-purple-500/20 to-violet-500/20 border-purple-400/50 text-purple-200',
    shadowColor: 'shadow-purple-500/20',
    icon: Database,
    layer: 3,
    label: 'Database'
  },
  devops: {
    colors: 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-400/50 text-orange-200',
    shadowColor: 'shadow-orange-500/20',
    icon: Cloud,
    layer: 4,
    label: 'DevOps'
  },
  mobile: {
    colors: 'bg-gradient-to-br from-pink-500/20 to-rose-500/20 border-pink-400/50 text-pink-200',
    shadowColor: 'shadow-pink-500/20',
    icon: Smartphone,
    layer: 1,
    label: 'Mobile'
  },
  ai: {
    colors: 'bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border-yellow-400/50 text-yellow-200',
    shadowColor: 'shadow-yellow-500/20',
    icon: Brain,
    layer: 2,
    label: 'AI/ML'
  },
  other: {
    colors: 'bg-gradient-to-br from-slate-500/20 to-gray-500/20 border-slate-400/50 text-slate-200',
    shadowColor: 'shadow-slate-500/20',
    icon: Settings,
    layer: 2,
    label: 'Tools'
  },
};

const roleStyles = {
  primary: 'ring-2 ring-blue-400/50 scale-105',
  secondary: 'ring-1 ring-slate-400/30',
  optional: 'opacity-75 ring-1 ring-slate-600/30',
};

export function StackPreview({ technologies, className, compact = false }: StackPreviewProps) {
  const architectureData = useMemo(() => {
    // Organize by both role and layer for architectural representation
    const byRole = {
      primary: technologies.filter(t => t.role === 'primary'),
      secondary: technologies.filter(t => t.role === 'secondary'),
      optional: technologies.filter(t => t.role === 'optional')
    };

    // Organize by architectural layers
    const byLayer = technologies.reduce((acc, tech) => {
      const layer = categoryConfig[tech.category]?.layer || 2;
      if (!acc[layer]) acc[layer] = [];
      acc[layer].push(tech);
      return acc;
    }, {} as Record<number, Technology[]>);

    // Create flow connections based on architectural logic
    const connections = [];
    const frontend = technologies.filter(t => t.category === 'frontend');
    const backend = technologies.filter(t => t.category === 'backend');
    const database = technologies.filter(t => t.category === 'database');
    const devops = technologies.filter(t => t.category === 'devops');

    // Frontend -> Backend connections
    frontend.forEach(fe => {
      backend.forEach(be => {
        connections.push({ from: fe.id, to: be.id, type: 'api' });
      });
    });

    // Backend -> Database connections
    backend.forEach(be => {
      database.forEach(db => {
        connections.push({ from: be.id, to: db.id, type: 'data' });
      });
    });

    return { byRole, byLayer, connections };
  }, [technologies]);

  const nodeSize = compact ? 'w-20 h-16' : 'w-28 h-20';
  const fontSize = compact ? 'text-xs' : 'text-sm';
  const iconSize = compact ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className={cn('relative bg-slate-900/50 rounded-xl p-6 backdrop-blur-sm border border-slate-800/50', className)}>
      {/* Background grid pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full" 
          style={{
            backgroundImage: `linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }} 
        />
      </div>

      {/* Architecture layers */}
      <div className="relative space-y-6">
        {/* Layer labels */}
        <div className="flex justify-between text-xs text-slate-400 font-medium mb-4">
          <span className="flex items-center gap-1">
            <Monitor className="w-3 h-3" />
            Presentation
          </span>
          <span className="flex items-center gap-1">
            <Server className="w-3 h-3" />
            Business Logic
          </span>
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3" />
            Data Layer
          </span>
          <span className="flex items-center gap-1">
            <Cloud className="w-3 h-3" />
            Infrastructure
          </span>
        </div>

        {/* Architectural layers */}
        {[1, 2, 3, 4].map(layerNum => {
          const layerTechs = architectureData.byLayer[layerNum] || [];
          if (layerTechs.length === 0) return null;

          return (
            <div key={layerNum} className={cn(
              'flex items-center justify-center gap-4 relative',
              layerNum === 1 && 'order-1', // Frontend/Mobile layer
              layerNum === 2 && 'order-2', // Backend/API layer  
              layerNum === 3 && 'order-3', // Database layer
              layerNum === 4 && 'order-4'  // DevOps/Infrastructure layer
            )}>
              {/* Layer connection lines */}
              {layerNum < 4 && architectureData.byLayer[layerNum + 1]?.length > 0 && (
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-10">
                  <ArrowDown className="w-4 h-4 text-slate-400/60" />
                </div>
              )}

              {layerTechs.map((tech, index) => {
                const config = categoryConfig[tech.category];
                const Icon = config.icon;
                
                return (
                  <div
                    key={tech.id}
                    className={cn(
                      nodeSize,
                      'group relative flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-300 hover:scale-105 cursor-pointer',
                      config.colors,
                      config.shadowColor,
                      'shadow-lg hover:shadow-xl',
                      tech.role === 'primary' && 'ring-2 ring-blue-400/30',
                      tech.role === 'secondary' && 'ring-1 ring-slate-400/20',
                      tech.role === 'optional' && 'opacity-80 ring-1 ring-slate-600/20'
                    )}
                  >
                    {/* Technology icon */}
                    <Icon className={cn(iconSize, 'mb-1 group-hover:scale-110 transition-transform')} />
                    
                    {/* Technology name */}
                    <div className={cn('font-semibold text-center leading-tight px-1', fontSize)}>
                      {tech.name}
                    </div>
                    
                    {/* Role indicator */}
                    <div className={cn(
                      'absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900',
                      tech.role === 'primary' && 'bg-blue-400',
                      tech.role === 'secondary' && 'bg-yellow-400', 
                      tech.role === 'optional' && 'bg-slate-400'
                    )} />
                    
                    {/* Hover tooltip */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                      {config.label} • {tech.role}
                    </div>

                    {/* Data flow indicators for connections */}
                    {architectureData.connections
                      .filter(conn => conn.from === tech.id)
                      .map((conn, connIndex) => (
                        <div
                          key={`flow-${connIndex}`}
                          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"
                        >
                          <div className={cn(
                            'w-1 h-4 rounded-full animate-pulse',
                            conn.type === 'api' && 'bg-blue-400',
                            conn.type === 'data' && 'bg-green-400'
                          )} />
                        </div>
                      ))
                    }
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Data flow visualization */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full">
            <defs>
              <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
              </linearGradient>
              <marker
                id="flowArrow"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L0,6 L8,3 z" fill="url(#flowGradient)" />
              </marker>
            </defs>
            
            {/* Animated data flow paths */}
            {architectureData.connections.map((conn, index) => (
              <g key={`flow-${index}`}>
                <path
                  d={`M${100 + (index * 50)},60 Q${150 + (index * 50)},80 ${200 + (index * 50)},100`}
                  stroke="url(#flowGradient)"
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#flowArrow)"
                  className="opacity-60"
                >
                  <animate
                    attributeName="stroke-dasharray"
                    values="0,100;100,0;0,100"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </path>
              </g>
            ))}
          </svg>
        </div>

        {/* Architecture summary */}
        <div className="mt-6 flex items-center justify-between text-xs text-slate-400 bg-slate-800/30 rounded-lg px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Core ({architectureData.byRole.primary.length})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span>Support ({architectureData.byRole.secondary.length})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-slate-400" />
              <span>Tools ({architectureData.byRole.optional.length})</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <Layers className="w-3 h-3" />
            <span>{Object.keys(architectureData.byLayer).length} layers</span>
          </div>
        </div>
      </div>
    </div>
  );
}