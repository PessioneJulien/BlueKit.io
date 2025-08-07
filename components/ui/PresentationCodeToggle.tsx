'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, FileText, Monitor } from 'lucide-react';
import { PresentationPreview } from './PresentationPreview';

interface PresentationCodeToggleProps {
  className?: string;
}

const readmeContent = `# Modern SaaS Stack

A production-ready stack for building modern SaaS applications.

## 🏗️ Architecture

- **Frontend**: Next.js 14 with Tailwind CSS and Framer Motion
- **Backend**: Node.js with Express and Prisma ORM  
- **Database**: PostgreSQL with Redis for caching
- **Storage**: AWS S3 for file uploads
- **Deployment**: Docker containers orchestrated with Kubernetes

## 📊 Resource Requirements

| Service    | CPU   | Memory | Storage |
|------------|-------|--------|---------|
| Frontend   | 1 core| 1GB    | 10GB    |
| Backend    | 2 cores| 2GB   | 20GB    |  
| Database   | 1 core| 1GB    | 50GB    |

**Total**: 4 cores, 4GB RAM, 80GB storage

## 🚀 Quick Start

\`\`\`bash
# Clone and start with Docker
git clone <repository>
cd modern-saas-stack
docker-compose up -d

# Or deploy to Kubernetes
kubectl apply -f k8s/
\`\`\`

## 💰 Estimated Monthly Cost

- **Development**: $25/month
- **Staging**: $45/month  
- **Production**: $150/month (with scaling)

## 🛠️ Setup Time

- Initial setup: 4 hours
- Customization: 2-8 hours
- Production deployment: 1 hour

*Generated automatically by BlueKit.io*`;

export const PresentationCodeToggle = ({ className }: PresentationCodeToggleProps) => {
  const [currentView, setCurrentView] = useState<'presentation' | 'readme'>('presentation');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-cycle entre présentation et README
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentView(prev => prev === 'presentation' ? 'readme' : 'presentation');
    }, 7000); // Change toutes les 7 secondes pour plus de temps de lecture

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl ${className}`}>
      {/* Header avec contrôles */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500">
            {currentView === 'presentation' ? 'Presentation Mode' : 'README.md'}
          </span>
          
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full transition-colors ${
              currentView === 'presentation' ? 'bg-blue-400' : 'bg-slate-600'
            }`} />
            <div className={`w-2 h-2 rounded-full transition-colors ${
              currentView === 'readme' ? 'bg-blue-400' : 'bg-slate-600'
            }`} />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Toggle manual */}
          <button
            onClick={() => {
              setCurrentView(prev => prev === 'presentation' ? 'readme' : 'presentation');
              setIsAutoPlaying(false);
            }}
            className="p-1 rounded bg-slate-700/50 hover:bg-slate-700 transition-colors"
            title={currentView === 'presentation' ? 'Show README' : 'Show Presentation'}
          >
            {currentView === 'presentation' ? (
              <FileText className="w-4 h-4 text-slate-400" />
            ) : (
              <Monitor className="w-4 h-4 text-slate-400" />
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
        </div>
      </div>
      
      {/* Contenu animé */}
      <div className="relative h-[400px]">
        <AnimatePresence mode="wait">
          {currentView === 'presentation' ? (
            <motion.div
              key="presentation"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
              className="absolute inset-0 p-8"
            >
              <PresentationPreview />
            </motion.div>
          ) : (
            <motion.div
              key="readme"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
              className="absolute inset-0 p-6"
            >
              <div className="h-full bg-slate-950/30 rounded-lg p-6 overflow-auto">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    📋
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">README.md</h4>
                    <p className="text-xs text-slate-400">Auto-generated documentation</p>
                  </div>
                </div>
                
                <div className="prose prose-slate prose-invert prose-sm max-w-none">
                  <pre className="text-sm text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                    {readmeContent}
                  </pre>
                </div>
                
                {/* Scroll indicator */}
                <div className="absolute bottom-4 right-4 bg-slate-800/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-slate-400">
                  Scroll for more ↓
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Progress bar pour auto-play */}
      {isAutoPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
          <motion.div
            key={`progress-${currentView}`}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 7, ease: 'linear' }}
          />
        </div>
      )}
    </div>
  );
};