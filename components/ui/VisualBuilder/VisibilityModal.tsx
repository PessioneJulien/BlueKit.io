'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Globe, Lock, Users, Eye } from 'lucide-react';

interface VisibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVisibility: boolean;
  onConfirm: (isPublic: boolean) => void;
  stackName: string;
}

export const VisibilityModal: React.FC<VisibilityModalProps> = ({
  isOpen,
  onClose,
  currentVisibility,
  onConfirm,
  stackName
}) => {
  if (!isOpen) return null;

  const targetVisibility = !currentVisibility;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card variant="glass" className="relative z-10 w-full max-w-md mx-4 border-slate-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {targetVisibility ? (
              <>
                <Globe className="w-5 h-5 text-blue-400" />
                Make Stack Public
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 text-amber-400" />
                Make Stack Private
              </>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-sm text-slate-300">
            Are you sure you want to change the visibility of 
            <span className="font-medium text-slate-100"> "{stackName}"</span>?
          </div>

          {/* Current vs New State */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
              <span className="text-sm text-slate-400">Current:</span>
              <div className="flex items-center gap-2">
                {currentVisibility ? (
                  <>
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-blue-400">Public</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-amber-400">Private</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg border border-slate-600">
              <span className="text-sm text-slate-300">New:</span>
              <div className="flex items-center gap-2">
                {targetVisibility ? (
                  <>
                    <Globe className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">Public</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-orange-400" />
                    <span className="text-sm text-orange-400">Private</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Implications */}
          <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-start gap-2">
              <Eye className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-400">
                {targetVisibility ? (
                  <>
                    <strong className="text-slate-300">Making public means:</strong>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• Anyone can view and discover your stack</li>
                      <li>• Stack will appear in public galleries</li>
                      <li>• Other users can fork and learn from it</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <strong className="text-slate-300">Making private means:</strong>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• Only you can access this stack</li>
                      <li>• Stack won't appear in public searches</li>
                      <li>• Others cannot discover or fork it</li>
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => onConfirm(targetVisibility)}
              className="flex-1"
            >
              {targetVisibility ? (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Make Public
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Make Private
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};