'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Eye, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  stackId: string;
  stackName: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  stackId,
  stackName
}) => {
  const [copied, setCopied] = useState(false);
  const [presentationUrl, setPresentationUrl] = useState('');

  useEffect(() => {
    if (isOpen && stackId) {
      const baseUrl = window.location.origin;
      const url = `${baseUrl}/presentation/${stackId}`;
      setPresentationUrl(url);
    }
  }, [isOpen, stackId]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(presentationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = presentationUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openPresentation = () => {
    window.open(presentationUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-400" />
              Stack sauvegardé !
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Votre stack &ldquo;{stackName}&rdquo; a été sauvegardé avec succès
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Lien de présentation
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-2">
                <input
                  type="text"
                  value={presentationUrl}
                  readOnly
                  className="w-full bg-transparent text-slate-200 text-sm border-none outline-none"
                />
              </div>
              <Button
                variant={copied ? "success" : "secondary"}
                size="sm"
                onClick={copyToClipboard}
                className="flex items-center gap-2 min-w-[80px]"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copier
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Partagez ce lien pour permettre à d&apos;autres de voir votre stack
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700 bg-slate-800/30">
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            Continuer l&apos;édition
          </Button>
          <Button
            variant="primary"
            onClick={openPresentation}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Voir la présentation
          </Button>
        </div>
      </div>
    </div>
  );
};