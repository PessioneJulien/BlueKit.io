'use client';

import { motion } from 'framer-motion';

interface StackVisualPreviewProps {
  className?: string;
}

export const StackVisualPreview = ({ className }: StackVisualPreviewProps) => {
  return (
    <div className={`bg-slate-950/50 rounded-lg p-8 relative ${className}`} 
      style={{
        backgroundImage: `radial-gradient(circle, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
        backgroundSize: '20px 20px'
      }}
    >
      {/* Container Node */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-8 left-8 bg-slate-800/90 border-2 border-blue-500/50 rounded-lg p-4 shadow-xl"
        style={{ width: '280px' }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            🐳
          </div>
          <div>
            <h4 className="text-white font-semibold">Docker Container</h4>
            <p className="text-xs text-slate-400">2 cores • 4GB RAM</p>
          </div>
        </div>
        
        {/* Nested Components */}
        <div className="space-y-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-slate-700/50 rounded p-2 flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded flex items-center justify-center text-sm">⚛️</div>
            <div className="flex-1">
              <p className="text-sm text-white">Next.js</p>
              <p className="text-xs text-slate-400">Frontend • Port 3000</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-slate-700/50 rounded p-2 flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded flex items-center justify-center text-sm">🟢</div>
            <div className="flex-1">
              <p className="text-sm text-white">Node.js</p>
              <p className="text-xs text-slate-400">Backend • Port 8080</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Standalone Node */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="absolute bottom-12 right-8 bg-slate-800/90 border border-purple-500/50 rounded-lg p-3 shadow-lg"
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500/30 to-violet-500/30 rounded-lg flex items-center justify-center">🐘</div>
          <div>
            <p className="text-sm text-white font-medium">PostgreSQL</p>
            <p className="text-xs text-slate-400">Database • 1GB</p>
          </div>
        </div>
      </motion.div>
      
      {/* Connection Line */}
      <svg className="absolute inset-0 pointer-events-none">
        <motion.path
          d="M 290 160 Q 320 200 260 240"
          stroke="rgb(168, 85, 247)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="5,5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.1, duration: 1.5, ease: "easeInOut" }}
        />
        {/* Connection point indicators */}
        <motion.circle
          cx="290"
          cy="160"
          r="4"
          fill="rgb(168, 85, 247)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.1, duration: 0.3 }}
        />
        <motion.circle
          cx="260"
          cy="240"
          r="4"
          fill="rgb(168, 85, 247)"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.8, duration: 0.3 }}
        />
      </svg>
      
      {/* Floating Badge */}
      <motion.div
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute top-4 right-4 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-medium border border-green-500/30"
      >
        Auto-save enabled
      </motion.div>
    </div>
  );
};