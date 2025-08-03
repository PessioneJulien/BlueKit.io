'use client';

import { X, Palette, Settings2 } from 'lucide-react';

interface ConnectionContextMenuProps {
  connectionId: string;
  isVisible: boolean;
  onDelete: (connectionId: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

export const ConnectionContextMenu: React.FC<ConnectionContextMenuProps> = ({
  connectionId,
  isVisible,
  onDelete,
  onClose,
  position
}) => {
  if (!isVisible) return null;

  const handleDelete = () => {
    onDelete(connectionId);
    onClose();
  };

  const handleStyleEdit = () => {
    // TODO: Ouvrir l'éditeur de style
    console.log('Éditer le style de la connexion:', connectionId);
    onClose();
  };

  return (
    <>
      {/* Backdrop pour fermer le menu */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Menu contextuel */}
      <div 
        className="fixed z-50 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 min-w-[160px]"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        {/* Modifier le style */}
        <button
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
          onClick={handleStyleEdit}
        >
          <Palette className="h-4 w-4" />
          Modifier le style
        </button>

        {/* Paramètres */}
        <button
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white"
          onClick={() => {
            console.log('Paramètres de la connexion:', connectionId);
            onClose();
          }}
        >
          <Settings2 className="h-4 w-4" />
          Paramètres
        </button>

        {/* Séparateur */}
        <div className="h-px bg-slate-700 my-1" />

        {/* Supprimer */}
        <button
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300"
          onClick={handleDelete}
        >
          <X className="h-4 w-4" />
          Supprimer la liaison
        </button>
      </div>
    </>
  );
};