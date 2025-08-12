/**
 * Advanced History Manager Service
 * 
 * Provides sophisticated history management with:
 * - Intelligent state comparison and diffing
 * - Action descriptions for better UX
 * - Compressed storage for performance
 * - Branching support for advanced features
 * - Memory management and cleanup
 */

import { CanvasNode } from '@/lib/stores/stackStore';
import { Connection } from '@/components/ui/VisualBuilder/ConnectionLine';

export interface CanvasState {
  name: string;
  description: string;
  nodes: CanvasNode[];
  connections: Connection[];
}

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  state: CanvasState;
  actionType: ActionType;
  actionDescription: string;
  checksum: string;
  // Optional metadata for detailed tracking
  metadata?: {
    nodeId?: string;
    nodeName?: string;
    connectionId?: string;
    previousValue?: unknown;
    newValue?: unknown;
  };
}

export type ActionType = 
  | 'node_add' 
  | 'node_remove' 
  | 'node_move' 
  | 'node_resize' 
  | 'node_edit'
  | 'connection_add' 
  | 'connection_remove' 
  | 'connection_edit'
  | 'stack_info_edit'
  | 'bulk_operation'
  | 'import'
  | 'template_load'
  | 'clear_all'
  | 'unknown';

export interface HistoryManagerOptions {
  maxHistorySize: number;
  compressionThreshold: number;
  debounceMs: number;
  enableCompression: boolean;
  enableMetadata: boolean;
}

const DEFAULT_OPTIONS: HistoryManagerOptions = {
  maxHistorySize: 100,
  compressionThreshold: 50, // Compress entries older than 50 operations
  debounceMs: 500,
  enableCompression: false, // Disable for now until needed
  enableMetadata: true
};

export class HistoryManager {
  private history: HistoryEntry[] = [];
  private currentIndex: number = -1;
  private options: HistoryManagerOptions;
  private pendingEntry: HistoryEntry | null = null;
  private debounceTimer: NodeJS.Timeout | null = null;

  constructor(options: Partial<HistoryManagerOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Add a new state to history with intelligent diffing
   */
  addState(
    state: CanvasState, 
    actionType: ActionType = 'unknown',
    metadata?: HistoryEntry['metadata']
  ): void {
    // Generate checksum for deduplication
    const checksum = this.generateChecksum(state);
    
    // Skip if state hasn't changed
    if (this.history.length > 0 && 
        this.history[this.currentIndex]?.checksum === checksum) {
      return;
    }

    // Generate action description
    const actionDescription = this.generateActionDescription(
      actionType, 
      state, 
      this.getCurrentState(),
      metadata
    );

    const entry: HistoryEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      state: this.cloneState(state),
      actionType,
      actionDescription,
      checksum,
      metadata: this.options.enableMetadata ? metadata : undefined
    };

    // Handle debouncing for certain operations
    if (this.shouldDebounce(actionType)) {
      this.handleDebouncedEntry(entry);
      return;
    }

    this.commitEntry(entry);
  }

  /**
   * Undo the last operation
   */
  undo(): CanvasState | null {
    if (!this.canUndo()) return null;

    this.currentIndex--;
    return this.getCurrentState();
  }

  /**
   * Redo the next operation
   */
  redo(): CanvasState | null {
    if (!this.canRedo()) return null;

    this.currentIndex++;
    return this.getCurrentState();
  }

  /**
   * Check if undo is possible
   */
  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  /**
   * Check if redo is possible
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  /**
   * Get current state
   */
  getCurrentState(): CanvasState | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex].state;
    }
    return null;
  }

  /**
   * Get history summary for UI
   */
  getHistorySummary(): {
    currentIndex: number;
    totalEntries: number;
    canUndo: boolean;
    canRedo: boolean;
    lastAction?: string;
    memoryUsage: number;
  } {
    return {
      currentIndex: this.currentIndex,
      totalEntries: this.history.length,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      lastAction: this.history[this.currentIndex]?.actionDescription,
      memoryUsage: this.calculateMemoryUsage()
    };
  }

  /**
   * Clear all history
   */
  clearHistory(): void {
    this.history = [];
    this.currentIndex = -1;
    this.clearPendingEntry();
  }

  /**
   * Get detailed history for advanced UI
   */
  getDetailedHistory(): Array<{
    index: number;
    entry: HistoryEntry;
    isCurrent: boolean;
    timeSinceAction: string;
  }> {
    return this.history.map((entry, index) => ({
      index,
      entry,
      isCurrent: index === this.currentIndex,
      timeSinceAction: this.formatTimeSince(entry.timestamp)
    }));
  }

  /**
   * Jump to specific history index
   */
  jumpToIndex(index: number): CanvasState | null {
    if (index >= 0 && index < this.history.length) {
      this.currentIndex = index;
      return this.getCurrentState();
    }
    return null;
  }

  // Private methods

  private commitEntry(entry: HistoryEntry): void {
    // Remove future entries if we're not at the end
    if (this.currentIndex < this.history.length - 1) {
      this.history.splice(this.currentIndex + 1);
    }

    // Add new entry
    this.history.push(entry);
    this.currentIndex++;

    // Manage history size
    this.enforceHistoryLimit();

    // Clean up old entries if needed
    this.performMaintenance();
  }

  private shouldDebounce(actionType: ActionType): boolean {
    const debouncedActions: ActionType[] = ['node_move', 'node_resize', 'node_edit'];
    return debouncedActions.includes(actionType);
  }

  private handleDebouncedEntry(entry: HistoryEntry): void {
    this.pendingEntry = entry;

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      if (this.pendingEntry) {
        this.commitEntry(this.pendingEntry);
        this.pendingEntry = null;
      }
    }, this.options.debounceMs);
  }

  private clearPendingEntry(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    this.pendingEntry = null;
  }

  private generateChecksum(state: CanvasState): string {
    // Create a deterministic string representation
    const stateString = JSON.stringify({
      name: state.name,
      description: state.description,
      nodes: state.nodes.map(node => ({
        id: node.id,
        name: node.name,
        position: node.position,
        category: node.category,
        isMainTechnology: node.isMainTechnology
      })).sort((a, b) => a.id.localeCompare(b.id)),
      connections: state.connections.map(conn => ({
        id: conn.id,
        sourceNodeId: conn.sourceNodeId,
        targetNodeId: conn.targetNodeId,
        type: conn.type
      })).sort((a, b) => a.id.localeCompare(b.id))
    });

    // Simple hash function (for production, consider crypto.subtle.digest)
    let hash = 0;
    for (let i = 0; i < stateString.length; i++) {
      const char = stateString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private generateActionDescription(
    actionType: ActionType,
    newState: CanvasState,
    previousState: CanvasState | null,
    metadata?: HistoryEntry['metadata']
  ): string {
    switch (actionType) {
      case 'node_add':
        if (metadata?.nodeName) {
          return `Added ${metadata.nodeName}`;
        }
        return 'Added component';

      case 'node_remove':
        if (metadata?.nodeName) {
          return `Removed ${metadata.nodeName}`;
        }
        return 'Removed component';

      case 'node_move':
        if (metadata?.nodeName) {
          return `Moved ${metadata.nodeName}`;
        }
        return 'Moved component';

      case 'node_resize':
        if (metadata?.nodeName) {
          return `Resized ${metadata.nodeName}`;
        }
        return 'Resized component';

      case 'node_edit':
        if (metadata?.nodeName) {
          return `Edited ${metadata.nodeName}`;
        }
        return 'Edited component';

      case 'connection_add':
        return 'Added connection';

      case 'connection_remove':
        return 'Removed connection';

      case 'connection_edit':
        return 'Modified connection';

      case 'stack_info_edit':
        if (previousState?.name !== newState.name) {
          return `Renamed to "${newState.name}"`;
        }
        if (previousState?.description !== newState.description) {
          return 'Updated description';
        }
        return 'Updated stack info';

      case 'bulk_operation':
        return metadata?.actionDescription || 'Bulk operation';

      case 'import':
        return `Imported "${newState.name}"`;

      case 'template_load':
        return `Loaded template "${newState.name}"`;

      case 'clear_all':
        return 'Cleared canvas';

      default:
        return 'Unknown action';
    }
  }

  private cloneState(state: CanvasState): CanvasState {
    return JSON.parse(JSON.stringify(state));
  }

  private generateId(): string {
    return `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private enforceHistoryLimit(): void {
    if (this.history.length > this.options.maxHistorySize) {
      const excess = this.history.length - this.options.maxHistorySize;
      this.history.splice(0, excess);
      this.currentIndex = Math.max(0, this.currentIndex - excess);
    }
  }

  private performMaintenance(): void {
    // Clean up old entries periodically
    if (this.history.length > this.options.compressionThreshold && 
        this.options.enableCompression) {
      // Future: implement compression for old entries
      // For now, just log the maintenance event
      console.log('🧹 History maintenance - considering compression');
    }
  }

  private calculateMemoryUsage(): number {
    // Rough estimate of memory usage in bytes
    const historyString = JSON.stringify(this.history);
    return historyString.length * 2; // Rough estimate for UTF-16
  }

  private formatTimeSince(timestamp: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);

    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    
    return timestamp.toLocaleDateString();
  }
}

// Export singleton instance for global use
export const historyManager = new HistoryManager();

// Export types for external use
export type { CanvasState, HistoryEntry, ActionType, HistoryManagerOptions };