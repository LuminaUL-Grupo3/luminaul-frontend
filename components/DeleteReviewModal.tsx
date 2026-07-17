import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteReviewModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteReviewModal({ isOpen, onConfirm, onCancel }: DeleteReviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl border border-border max-w-md w-full mx-4 p-8 animate-in zoom-in-95">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl mb-3">Eliminar reseña</h2>
          <p className="text-muted-foreground">
            ¿Estás seguro de que deseas eliminar esta reseña? Esta acción no se puede deshacer.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onConfirm}
            className="w-full flex items-center justify-center gap-2 h-12 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors font-medium"
          >
            <Trash2 className="w-5 h-5" />
            Eliminar
          </button>
          <button
            onClick={onCancel}
            className="w-full h-12 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted transition-colors font-medium"
          >
            Cancelar
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            La reseña se eliminará de forma permanente del perfil del estudiante
          </p>
        </div>
      </div>
    </div>
  );
}
