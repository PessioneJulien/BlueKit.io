/**
 * Enhanced Visual Stack Builder
 * 
 * Integration of the new auto-save and history system into the visual builder
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useStackBuilder } from '@/lib/hooks/useStackBuilder';
import { CanvasState, ActionType } from '@/lib/services/historyManager';
import { EnhancedSaveIndicator } from '../EnhancedSaveIndicator';
import { EnhancedUndoRedoControls } from '../EnhancedUndoRedoControls';
import { EnhancedAutoSaveRestoreModal } from '../EnhancedAutoSaveRestoreModal';
import { Button } from '../Button';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import { Badge } from '../Badge';
import { useUserStore } from '@/lib/stores/userStore';
import { useStackLimits } from '@/lib/hooks/useStackLimits';
import { UpgradeModal } from '../UpgradeModal';

import { 
  Share2,
  Download,
  Layers,
  Zap,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2
} from 'lucide-react';

import type { CanvasNode } from '@/lib/stores/stackStore';

interface EnhancedVisualStackBuilderProps {
  initialStack?: CanvasState;
  onStackChange?: (stack: CanvasState) => void;
  className?: string;
  enableFeatures?: {
    autoSave?: boolean;
    history?: boolean;
    keyboardShortcuts?: boolean;
    sharing?: boolean;
    export?: boolean;
    templates?: boolean;
  };
}

export const EnhancedVisualStackBuilder: React.FC<EnhancedVisualStackBuilderProps> = ({
  initialStack,
  onStackChange,
  className,
  enableFeatures = {
    autoSave: true,
    history: true,
    keyboardShortcuts: true,
    sharing: true,
    export: true,
    templates: true
  }
}) => {
  const { user } = useUserStore();
  
  // Default initial state
  const defaultInitialState: CanvasState = initialStack || {
    name: '',
    description: '',
    nodes: [],
    connections: []
  };

  // Enhanced stack builder hook
  const stackBuilder = useStackBuilder(defaultInitialState, {
    autoSave: {
      key: 'visual_stack_builder',
      enabled: enableFeatures.autoSave,
      debounceMs: 2000
    },
    history: {
      maxHistorySize: 100,
      enabled: enableFeatures.history
    },
    enableKeyboardShortcuts: enableFeatures.keyboardShortcuts,
    onStateChange: (state) => {
      if (onStackChange) {
        onStackChange(state);
      }
    }
  });

  // Premium limits hook
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    reason: string;
    currentCount?: number;
    limit?: number;
  }>({
    isOpen: false,
    reason: ''
  });

  const { checkComponentLimit } = useStackLimits(
    (reason, currentCount, limit) => {
      setUpgradeModal({
        isOpen: true,
        reason,
        currentCount,
        limit
      });
    }
  );

  // UI State
  const [showSidebar, setShowSidebar] = useState(true);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showUpgradeSuccess] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check for auto-save on mount
  useEffect(() => {
    if (stackBuilder.isReady && stackBuilder.hasAutoSave) {
      setShowRestoreModal(true);
    }
  }, [stackBuilder.isReady, stackBuilder.hasAutoSave]);

  // Handle stack updates
  const handleStackUpdate = useCallback((
    updates: Partial<CanvasState>,
    actionType: ActionType = 'unknown',
    metadata?: Record<string, unknown>
  ) => {
    if (!stackBuilder.currentState) return;

    const newState: CanvasState = {
      ...stackBuilder.currentState,
      ...updates
    };

    stackBuilder.updateState(newState, actionType, metadata);
  }, [stackBuilder]);

  // Handle node operations
  const handleAddNode = useCallback((node: CanvasNode) => {
    if (!checkComponentLimit(stackBuilder.currentState?.nodes.length || 0)) {
      return;
    }

    const newNodes = [...(stackBuilder.currentState?.nodes || []), node];
    handleStackUpdate(
      { nodes: newNodes },
      'node_add',
      { nodeId: node.id, nodeName: node.name }
    );
  }, [stackBuilder.currentState?.nodes, checkComponentLimit, handleStackUpdate]);

  const handleRemoveNode = useCallback((nodeId: string) => {
    if (!stackBuilder.currentState) return;

    const nodeToRemove = stackBuilder.currentState.nodes.find(n => n.id === nodeId);
    const newNodes = stackBuilder.currentState.nodes.filter(n => n.id !== nodeId);
    const newConnections = stackBuilder.currentState.connections.filter(
      c => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId
    );

    handleStackUpdate(
      { nodes: newNodes, connections: newConnections },
      'node_remove',
      { nodeId, nodeName: nodeToRemove?.name }
    );
  }, [stackBuilder.currentState, handleStackUpdate]);

  const handleMoveNode = useCallback((nodeId: string, position: { x: number; y: number }) => {
    if (!stackBuilder.currentState) return;

    const newNodes = stackBuilder.currentState.nodes.map(node =>
      node.id === nodeId ? { ...node, position } : node
    );

    handleStackUpdate(
      { nodes: newNodes },
      'node_move',
      { nodeId, nodeName: stackBuilder.currentState.nodes.find(n => n.id === nodeId)?.name }
    );
  }, [stackBuilder.currentState, handleStackUpdate]);

  // Handle restore modal
  const handleRestore = async () => {
    await stackBuilder.loadSave();
    setShowRestoreModal(false);
  };

  const handleDiscardSave = async () => {
    await stackBuilder.clearSave();
    setShowRestoreModal(false);
  };

  // Loading state
  if (!stackBuilder.isReady) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading enhanced stack builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('h-full flex flex-col bg-slate-900', className)}>
      {/* Header with enhanced controls */}
      <div className="border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center justify-between p-4">
          {/* Left section - Stack info */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-white truncate max-w-64">
                {stackBuilder.currentState?.name || 'Untitled Stack'}
              </h1>
              {stackBuilder.currentState?.description && (
                <p className="text-sm text-slate-400 truncate max-w-80">
                  {stackBuilder.currentState.description}
                </p>
              )}
            </div>

            {/* Stack stats */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" size="sm">
                {stackBuilder.currentState?.nodes.length || 0} components
              </Badge>
              <Badge variant="outline" size="sm">
                {stackBuilder.currentState?.connections.length || 0} connections
              </Badge>
            </div>
          </div>

          {/* Center section - Auto-save indicator */}
          <div className="flex items-center gap-4">
            {enableFeatures.autoSave && (
              <EnhancedSaveIndicator
                status={stackBuilder.saveStatus}
                lastSaved={stackBuilder.lastSaved}
                hasUnsavedChanges={stackBuilder.hasUnsavedChanges}
                hasAutoSave={stackBuilder.hasAutoSave}
                isOnline={isOnline}
                variant="compact"
                onForceSave={stackBuilder.forceSave}
                onLoadSave={() => setShowRestoreModal(true)}
                onClearSave={stackBuilder.clearSave}
              />
            )}

            {enableFeatures.history && (
              <EnhancedUndoRedoControls
                historyState={{
                  canUndo: stackBuilder.canUndo,
                  canRedo: stackBuilder.canRedo,
                  undo: stackBuilder.undo,
                  redo: stackBuilder.redo,
                  clearHistory: stackBuilder.clearHistory,
                  jumpToIndex: stackBuilder.jumpToHistoryIndex,
                  currentIndex: stackBuilder.historyInfo.currentIndex,
                  totalEntries: stackBuilder.historyInfo.totalEntries,
                  lastAction: stackBuilder.historyInfo.lastAction,
                  memoryUsage: stackBuilder.historyInfo.memoryUsage,
                  getDetailedHistory: stackBuilder.getDetailedHistory
                }}
                variant="compact"
                showHistoryPanel={true}
              />
            )}
          </div>

          {/* Right section - Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              title="Toggle sidebar"
            >
              {showSidebar ? <ChevronRight /> : <ChevronLeft />}
            </Button>

            {enableFeatures.sharing && (
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
            )}

            {enableFeatures.export && (
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
                Export
              </Button>
            )}

            <Button variant="default" size="sm" onClick={stackBuilder.forceSave}>
              Save Stack
            </Button>
          </div>
        </div>

        {/* Upgrade success banner */}
        <AnimatePresence>
          {showUpgradeSuccess && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-green-500/10 border-t border-green-500/30 px-4 py-2"
            >
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm">
                  Upgrade successful! You now have access to premium features.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 320 }}
              exit={{ width: 0 }}
              transition={{ duration: 0.2 }}
              className="border-r border-slate-700 bg-slate-800/30 overflow-hidden"
            >
              <div className="w-80 h-full overflow-y-auto p-4">
                {/* Component palette would go here */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Components
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-400">
                      Component palette integration coming next...
                    </p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Canvas area */}
        <div className="flex-1 relative">
          {/* Canvas placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Layers className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-400 mb-2">
                Enhanced Stack Builder
              </h3>
              <p className="text-slate-500 max-w-md">
                The enhanced visual canvas with auto-save and history is ready. 
                Integration with the existing ReactFlow canvas is the next step.
              </p>
              
              {/* Demo features */}
              <div className="mt-6 space-y-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const demoNode: CanvasNode = {
                      id: `demo-${Date.now()}`,
                      name: 'React',
                      category: 'frontend',
                      description: 'Demo component',
                      setupTimeHours: 1,
                      difficulty: 'beginner',
                      pricing: 'free',
                      isMainTechnology: true,
                      position: { x: Math.random() * 400, y: Math.random() * 300 },
                      isCompact: true,
                      width: 200,
                      height: 80
                    };
                    handleAddNode(demoNode);
                  }}
                >
                  Add Demo Node
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => {
                    handleStackUpdate(
                      { name: `Stack ${Date.now()}`, description: 'Updated via enhanced system' },
                      'stack_info_edit'
                    );
                  }}
                >
                  Update Stack Info
                </Button>
              </div>
            </div>
          </div>

          {/* Development info overlay */}
          <div className="absolute top-4 left-4 right-4">
            <Card className="bg-blue-500/10 border-blue-500/30">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-blue-400">
                      Enhanced System Active
                    </h4>
                    <p className="text-xs text-blue-300/80 mt-1">
                      Auto-save: {stackBuilder.saveStatus} | 
                      History: {stackBuilder.historyInfo.totalEntries} entries | 
                      Changes: {stackBuilder.hasChanges ? 'Yes' : 'No'}
                    </p>
                    {stackBuilder.lastSaved && (
                      <p className="text-xs text-blue-300/60 mt-1">
                        Last saved: {stackBuilder.lastSaved.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Auto-save restore modal */}
      {enableFeatures.autoSave && (
        <EnhancedAutoSaveRestoreModal
          isOpen={showRestoreModal}
          onClose={() => setShowRestoreModal(false)}
          localSave={stackBuilder.hasAutoSave ? {
            canvasState: stackBuilder.currentState || defaultInitialState,
            lastSaved: stackBuilder.lastSaved || new Date(),
            source: 'local'
          } : null}
          currentState={stackBuilder.currentState}
          onRestore={handleRestore}
          onDiscard={handleDiscardSave}
        />
      )}

      {/* Upgrade modal */}
      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={() => setUpgradeModal({ isOpen: false, reason: '' })}
        reason={upgradeModal.reason}
        currentCount={upgradeModal.currentCount}
        limit={upgradeModal.limit}
      />
    </div>
  );
};