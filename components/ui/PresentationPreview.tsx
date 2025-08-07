'use client';

import { motion } from 'framer-motion';

interface PresentationPreviewProps {
  className?: string;
}

export const PresentationPreview = ({ className }: PresentationPreviewProps) => {
  return (
    <div className={`bg-gradient-to-br from-slate-900 to-slate-950 ${className}`}>
      {/* Presentation Slide Mock */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white mb-6">Modern SaaS Architecture</h3>
        
        {/* Stack Visual */}
        <div className="flex justify-center gap-6 mb-8">
          {/* Frontend Stack */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700"
          >
            <div className="text-3xl mb-2">🎨</div>
            <h4 className="text-white font-semibold mb-2 text-sm">Frontend</h4>
            <div className="space-y-1">
              <div className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-xs">Next.js 14</div>
              <div className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded text-xs">Tailwind</div>
              <div className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-xs">Framer</div>
            </div>
          </motion.div>
          
          {/* Backend Stack */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700"
          >
            <div className="text-3xl mb-2">⚙️</div>
            <h4 className="text-white font-semibold mb-2 text-sm">Backend</h4>
            <div className="space-y-1">
              <div className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded text-xs">Node.js</div>
              <div className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-xs">Express</div>
              <div className="bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded text-xs">Prisma</div>
            </div>
          </motion.div>
          
          {/* Database Stack */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            viewport={{ once: true }}
            className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700"
          >
            <div className="text-3xl mb-2">🗄️</div>
            <h4 className="text-white font-semibold mb-2 text-sm">Database</h4>
            <div className="space-y-1">
              <div className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded text-xs">PostgreSQL</div>
              <div className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded text-xs">Redis</div>
              <div className="bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded text-xs">S3</div>
            </div>
          </motion.div>
        </div>
        
        {/* Stats */}
        <div className="flex justify-center gap-6 text-xs">
          <div className="text-slate-400">
            <span className="text-white font-semibold">Setup:</span> 4h
          </div>
          <div className="text-slate-400">
            <span className="text-white font-semibold">Cost:</span> $45/mo
          </div>
          <div className="text-slate-400">
            <span className="text-white font-semibold">Level:</span> Intermediate
          </div>
        </div>
        
        {/* Navigation Dots */}
        <div className="flex justify-center gap-1.5 mt-6">
          <div className="w-8 h-1 bg-blue-400 rounded-full" />
          <div className="w-8 h-1 bg-slate-600 rounded-full" />
          <div className="w-8 h-1 bg-slate-600 rounded-full" />
        </div>
      </div>
    </div>
  );
};