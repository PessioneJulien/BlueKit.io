'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  Eye, 
  Edit, 
  Share2, 
  Download,
  Maximize2,
  Minimize2,
  Info,
  Save,
  Copy,
  Link,
  Code,
  Sidebar,
  ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PresentationToolbarProps {
  isEditMode: boolean;
  allowEdit: boolean;
  showSidebar: boolean;
  canSave: boolean;
  onToggleEdit: () => void;
  onToggleSidebar: () => void;
  onFullscreen: () => void;
  onSave: () => void;
  stackId?: string;
}

export const PresentationToolbar: React.FC<PresentationToolbarProps> = ({
  isEditMode,
  allowEdit,
  showSidebar,
  canSave,
  onToggleEdit,
  onToggleSidebar,
  onFullscreen,
  onSave,
  stackId
}) => {
  const router = useRouter();
  const [showShareMenu, setShowShareMenu] = useState(false);

  const copyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    // TODO: Add toast notification
    console.log('Link copied to clipboard');
  };

  const copyEmbedCode = () => {
    const embedCode = `<iframe src="${window.location.href}?embed=true" width="800" height="600" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    // TODO: Add toast notification
    console.log('Embed code copied to clipboard');
  };

  const exportData = () => {
    // TODO: Implement export functionality
    console.log('Export presentation data');
  };

  const openInBuilder = () => {
    if (stackId) {
      router.push(`/builder?stackId=${stackId}`);
    } else {
      router.push('/builder');
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Info Toggle */}
      <Button
        variant={showSidebar ? "primary" : "ghost"}
        size="sm"
        onClick={onToggleSidebar}
        className="flex items-center gap-2"
      >
        <Sidebar className="w-4 h-4" />
        Info
      </Button>

      {/* Edit Mode Toggle */}
      {allowEdit && (
        <Button
          variant={isEditMode ? "primary" : "secondary"}
          size="sm"
          onClick={onToggleEdit}
          className="flex items-center gap-2"
        >
          {isEditMode ? (
            <>
              <Edit className="w-4 h-4" />
              Editing
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              View Only
            </>
          )}
        </Button>
      )}

      {/* Open in Builder */}
      <Button
        variant="secondary"
        size="sm"
        onClick={openInBuilder}
        className="flex items-center gap-2"
        title="Ouvrir dans le Builder pour une édition complète"
      >
        <ExternalLink className="w-4 h-4" />
        Builder
      </Button>

      {/* Save Button (only in edit mode) */}
      {isEditMode && canSave && (
        <Button
          variant="success"
          size="sm"
          onClick={onSave}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save
        </Button>
      )}

      {/* Share Menu */}
      <div className="relative">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>

        {showShareMenu && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowShareMenu(false)}
            />
            <div className="absolute top-full right-0 mt-2 z-20 bg-slate-800 border border-slate-700 rounded-lg shadow-lg min-w-[200px]">
              <div className="p-2">
                <button 
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors"
                  onClick={() => {
                    copyLink();
                    setShowShareMenu(false);
                  }}
                >
                  <Link className="w-4 h-4" />
                  Copy Link
                </button>
                <button 
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors"
                  onClick={() => {
                    copyEmbedCode();
                    setShowShareMenu(false);
                  }}
                >
                  <Code className="w-4 h-4" />
                  Copy Embed Code
                </button>
                <button 
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 rounded transition-colors"
                  onClick={() => {
                    exportData();
                    setShowShareMenu(false);
                  }}
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Fullscreen Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onFullscreen}
        className="flex items-center gap-2"
        title="Toggle Fullscreen"
      >
        <Maximize2 className="w-4 h-4" />
      </Button>
    </div>
  );
};