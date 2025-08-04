'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Box, 
  Layers,
  Settings,
  Info
} from 'lucide-react';

export type ContainerViewType = 'nested';

interface ContainerViewManagerProps {
  currentView: ContainerViewType;
  onViewChange: (view: ContainerViewType) => void;
  className?: string;
}

export const ContainerViewManager: React.FC<ContainerViewManagerProps> = ({
  currentView,
  onViewChange,
  className = ''
}) => {
  const [showInfo, setShowInfo] = useState(false);

  const toggleInfo = useCallback(() => {
    setShowInfo(prev => !prev);
  }, []);

  return (
    <div className={`bg-slate-800 border border-slate-700 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-200 flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Vue Conteneurs
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleInfo}
          className="h-6 w-6 p-0"
        >
          <Info className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex gap-2 mb-3">
        <Button
          variant="primary"
          size="sm"
          className="flex items-center gap-2 text-xs"
        >
          <Box className="h-3 w-3" />
          Mode Imbriqué
        </Button>
      </div>

      {showInfo && (
        <div className="bg-slate-900 rounded-md p-3 text-xs text-slate-300 space-y-2">
          <div>
            <Badge variant="secondary" className="text-xs mb-1">Mode Imbriqué</Badge>
            <p>Docker/Kubernetes deviennent des conteneurs visuels qui englobent les composants.</p>
          </div>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-slate-700">
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <Settings className="h-3 w-3" />
          Vue active: Conteneurs Imbriqués
        </div>
      </div>
    </div>
  );
};