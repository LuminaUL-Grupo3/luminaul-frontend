import { AlertTriangle } from 'lucide-react';

interface DiscardChangesModalProps {
  isOpen: boolean;
  onKeepEditing: () => void;
  onDiscard: () => void;
}

export function DiscardChangesModal({ isOpen, onKeepEditing, onDiscard }: DiscardChangesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl border border-border max-w-md w-full mx-4 p-8 animate-in zoom-in-95">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl mb-3">¿Deseas descartar los cambios?</h2>
          <p className="text-muted-foreground">
            Los cambios realizados en tu reseña se perderán y no podrán recuperarse.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onDiscard}
            className="w-full flex items-center justify-center gap-2 h-12 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors font-medium"
          >
            Descartar cambios
          </button>
          <button
            onClick={onKeepEditing}
            className="w-full h-12 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted transition-colors font-medium"
          >
            Seguir editando
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Tu reseña original permanecerá publicada sin modificaciones
          </p>
        </div>
      </div>
    </div>
  );
}
