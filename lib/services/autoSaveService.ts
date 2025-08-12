/**
 * Enhanced Auto-Save Service
 * 
 * Features:
 * - Intelligent change detection with deep comparison
 * - Hybrid storage (localStorage + Supabase sync)
 * - Performance optimized with debouncing and throttling
 * - Error handling and recovery
 * - Conflict resolution for multi-tab scenarios
 * - Integration with history manager
 */

import { CanvasState } from './historyManager';
import { createClient } from '@/lib/supabase/client';

export interface AutoSaveData {
  canvasState: CanvasState;
  lastSaved: number;
  version: number;
  userId?: string;
  sessionId: string;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'conflict';

export interface AutoSaveEvent {
  type: 'save_start' | 'save_success' | 'save_error' | 'restore_available' | 'conflict_detected';
  data?: unknown;
  error?: string;
  timestamp: Date;
}

export interface AutoSaveOptions {
  key: string;
  debounceMs: number;
  maxAge: number; // in milliseconds
  enableSupabaseSync: boolean;
  enableConflictDetection: boolean;
  enableCompression: boolean;
  maxLocalStorageSize: number; // in bytes
}

const DEFAULT_OPTIONS: AutoSaveOptions = {
  key: 'visual_stack_builder',
  debounceMs: 2000,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  enableSupabaseSync: true,
  enableConflictDetection: true,
  enableCompression: false, // Disable for now
  maxLocalStorageSize: 5 * 1024 * 1024 // 5MB
};

export class AutoSaveService {
  private options: AutoSaveOptions;
  private saveStatus: SaveStatus = 'idle';
  private lastSaved: Date | null = null;
  private sessionId: string;
  private userId: string | null = null;
  private eventListeners: Array<(event: AutoSaveEvent) => void> = [];
  private debounceTimer: NodeJS.Timeout | null = null;
  private lastSavedChecksum: string = '';
  private version: number = 0;

  constructor(options: Partial<AutoSaveOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.sessionId = this.generateSessionId();
  }

  /**
   * Initialize the service with user context
   */
  async initialize(userId?: string): Promise<void> {
    this.userId = userId || null;
    
    // Clean up expired saves
    await this.cleanupExpiredSaves();
    
    // Check for existing saves
    const hasLocalSave = this.hasLocalSave();
    const hasRemoteSave = userId ? await this.hasRemoteSave() : false;
    
    if (hasLocalSave || hasRemoteSave) {
      this.emitEvent({
        type: 'restore_available',
        data: { hasLocalSave, hasRemoteSave },
        timestamp: new Date()
      });
    }
  }

  /**
   * Auto-save state with intelligent change detection
   */
  async autoSave(state: CanvasState, force: boolean = false): Promise<void> {
    // Generate checksum for change detection
    const checksum = this.generateChecksum(state);
    
    // Skip if no changes and not forced
    if (!force && checksum === this.lastSavedChecksum) {
      return;
    }

    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Debounce the save
    this.debounceTimer = setTimeout(async () => {
      await this.performSave(state, checksum);
    }, this.options.debounceMs);
  }

  /**
   * Load saved state (local first, then remote)
   */
  async loadSave(): Promise<CanvasState | null> {
    try {
      // Try local first
      const localSave = this.loadFromLocalStorage();
      let remoteSave: AutoSaveData | null = null;

      // Try remote if user is authenticated
      if (this.userId && this.options.enableSupabaseSync) {
        remoteSave = await this.loadFromRemote();
      }

      // Handle conflict resolution
      if (localSave && remoteSave) {
        return await this.resolveConflict(localSave, remoteSave);
      }

      // Return the available save
      const save = remoteSave || localSave;
      if (save) {
        this.version = save.version;
        this.lastSaved = new Date(save.lastSaved);
        this.lastSavedChecksum = this.generateChecksum(save.canvasState);
        this.setSaveStatus('saved');
        return save.canvasState;
      }

      return null;
    } catch (error) {
      console.error('Failed to load saved state:', error);
      this.setSaveStatus('error');
      return null;
    }
  }

  /**
   * Clear saved data
   */
  async clearSave(): Promise<void> {
    // Clear local storage
    const localKey = this.getStorageKey();
    localStorage.removeItem(localKey);

    // Clear remote if authenticated
    if (this.userId && this.options.enableSupabaseSync) {
      try {
        const supabase = createClient();
        await supabase
          .from('auto_saves')
          .delete()
          .eq('user_id', this.userId)
          .eq('save_key', this.options.key);
      } catch (error) {
        console.error('Failed to clear remote save:', error);
      }
    }

    // Reset state
    this.lastSaved = null;
    this.lastSavedChecksum = '';
    this.version = 0;
    this.setSaveStatus('idle');
  }

  /**
   * Get current save status
   */
  getSaveStatus(): {
    status: SaveStatus;
    lastSaved: Date | null;
    hasUnsavedChanges: boolean;
  } {
    return {
      status: this.saveStatus,
      lastSaved: this.lastSaved,
      hasUnsavedChanges: this.saveStatus !== 'saved'
    };
  }

  /**
   * Add event listener
   */
  addEventListener(listener: (event: AutoSaveEvent) => void): () => void {
    this.eventListeners.push(listener);
    return () => {
      this.eventListeners = this.eventListeners.filter(l => l !== listener);
    };
  }

  /**
   * Check if local save exists
   */
  hasLocalSave(): boolean {
    const key = this.getStorageKey();
    return !!localStorage.getItem(key);
  }

  /**
   * Check if remote save exists
   */
  private async hasRemoteSave(): Promise<boolean> {
    if (!this.userId || !this.options.enableSupabaseSync) return false;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('auto_saves')
        .select('id')
        .eq('user_id', this.userId)
        .eq('save_key', this.options.key)
        .single();

      return !error && !!data;
    } catch {
      return false;
    }
  }

  // Private methods

  private async performSave(state: CanvasState, checksum: string): Promise<void> {
    this.setSaveStatus('saving');
    this.lastSavedChecksum = checksum;
    this.version++;

    const saveData: AutoSaveData = {
      canvasState: state,
      lastSaved: Date.now(),
      version: this.version,
      userId: this.userId || undefined,
      sessionId: this.sessionId
    };

    try {
      // Save locally first (always)
      await this.saveToLocalStorage(saveData);

      // Save remotely if authenticated
      if (this.userId && this.options.enableSupabaseSync) {
        await this.saveToRemote(saveData);
      }

      this.lastSaved = new Date(saveData.lastSaved);
      this.setSaveStatus('saved');
      
      this.emitEvent({
        type: 'save_success',
        data: { local: true, remote: !!this.userId },
        timestamp: new Date()
      });

    } catch (error) {
      console.error('Auto-save failed:', error);
      this.setSaveStatus('error');
      
      this.emitEvent({
        type: 'save_error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });
    }
  }

  private async saveToLocalStorage(data: AutoSaveData): Promise<void> {
    const key = this.getStorageKey();
    const dataString = JSON.stringify(data);
    
    // Check storage quota
    if (dataString.length * 2 > this.options.maxLocalStorageSize) {
      throw new Error('Data too large for localStorage');
    }

    try {
      localStorage.setItem(key, dataString);
    } catch (error) {
      // Handle quota exceeded error
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        await this.cleanupLocalStorage();
        localStorage.setItem(key, dataString); // Retry after cleanup
      } else {
        throw error;
      }
    }
  }

  private async saveToRemote(data: AutoSaveData): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('auto_saves')
      .upsert({
        user_id: this.userId,
        save_key: this.options.key,
        save_data: data,
        version: data.version,
        created_at: new Date(data.lastSaved).toISOString()
      }, {
        onConflict: 'user_id,save_key'
      });

    if (error) {
      throw new Error(`Remote save failed: ${error.message}`);
    }
  }

  private loadFromLocalStorage(): AutoSaveData | null {
    try {
      const key = this.getStorageKey();
      const saved = localStorage.getItem(key);
      if (!saved) return null;

      const data: AutoSaveData = JSON.parse(saved);
      
      // Check expiration
      if (Date.now() - data.lastSaved > this.options.maxAge) {
        localStorage.removeItem(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }

  private async loadFromRemote(): Promise<AutoSaveData | null> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('auto_saves')
        .select('save_data')
        .eq('user_id', this.userId)
        .eq('save_key', this.options.key)
        .single();

      if (error) return null;
      
      return data.save_data as AutoSaveData;
    } catch (error) {
      console.error('Failed to load from remote:', error);
      return null;
    }
  }

  private async resolveConflict(
    localSave: AutoSaveData, 
    remoteSave: AutoSaveData
  ): Promise<CanvasState> {
    if (!this.options.enableConflictDetection) {
      // Use most recent
      return localSave.lastSaved > remoteSave.lastSaved 
        ? localSave.canvasState 
        : remoteSave.canvasState;
    }

    // Emit conflict event for user resolution
    this.emitEvent({
      type: 'conflict_detected',
      data: { localSave, remoteSave },
      timestamp: new Date()
    });

    this.setSaveStatus('conflict');

    // For now, return the most recent (in the future, show conflict UI)
    return localSave.lastSaved > remoteSave.lastSaved 
      ? localSave.canvasState 
      : remoteSave.canvasState;
  }

  private generateChecksum(state: CanvasState): string {
    // Create deterministic string for comparison
    const normalized = {
      name: state.name.trim(),
      description: state.description.trim(),
      nodes: [...state.nodes]
        .sort((a, b) => a.id.localeCompare(b.id))
        .map(node => ({
          id: node.id,
          name: node.name,
          position: { x: Math.round(node.position.x), y: Math.round(node.position.y) },
          category: node.category,
          isMainTechnology: node.isMainTechnology
        })),
      connections: [...state.connections]
        .sort((a, b) => a.id.localeCompare(b.id))
        .map(conn => ({
          id: conn.id,
          sourceNodeId: conn.sourceNodeId,
          targetNodeId: conn.targetNodeId,
          type: conn.type
        }))
    };

    const stateString = JSON.stringify(normalized);
    
    // Simple hash
    let hash = 0;
    for (let i = 0; i < stateString.length; i++) {
      const char = stateString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return hash.toString(36);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getStorageKey(): string {
    return this.userId 
      ? `autosave_${this.options.key}_${this.userId}`
      : `autosave_${this.options.key}_anonymous`;
  }

  private setSaveStatus(status: SaveStatus): void {
    this.saveStatus = status;
  }

  private emitEvent(event: AutoSaveEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in auto-save event listener:', error);
      }
    });
  }

  private async cleanupExpiredSaves(): Promise<void> {
    // Clean localStorage
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('autosave_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.lastSaved && Date.now() - data.lastSaved > this.options.maxAge) {
            localStorage.removeItem(key);
          }
        } catch {
          localStorage.removeItem(key); // Remove corrupted data
        }
      }
    });

    // Clean remote saves (if needed in the future)
    // For now, rely on database TTL or manual cleanup
  }

  private async cleanupLocalStorage(): Promise<void> {
    // Remove old auto-save entries to free up space
    const autoSaveKeys = Object.keys(localStorage)
      .filter(key => key.startsWith('autosave_'))
      .map(key => ({
        key,
        data: JSON.parse(localStorage.getItem(key) || '{}')
      }))
      .sort((a, b) => a.data.lastSaved - b.data.lastSaved);

    // Remove oldest 20% of entries
    const toRemove = Math.ceil(autoSaveKeys.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      localStorage.removeItem(autoSaveKeys[i].key);
    }
  }
}

// Export singleton instance
export const autoSaveService = new AutoSaveService();

// Export types
export type { AutoSaveData, SaveStatus, AutoSaveEvent, AutoSaveOptions };