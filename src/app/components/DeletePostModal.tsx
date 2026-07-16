import { useState } from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { deletePost } from '../../api/posts';

interface DeletePostModalProps {
  postId: string;
  open: boolean;
  onClose: () => void;
  onDeleted?: (postId: string) => void;
}

export function DeletePostModal({ postId, open, onClose, onDeleted }: DeletePostModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await deletePost(postId);
      setShowSuccess(true);
      onDeleted?.(result.publication_id);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar la publicación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl border border-border max-w-sm w-full mx-4 p-6">
        {showSuccess ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Publicación eliminada</h2>
            <p className="text-sm text-muted-foreground">Ya no se mostrará en el feed.</p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <h2 className="text-lg font-semibold">¿Eliminar esta publicación?</h2>
              </div>
              <button
                onClick={onClose}
                disabled={loading}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors flex-shrink-0 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Dejará de verse en el feed. Esta acción se puede auditar luego desde tu historial.
            </p>

            {error && (
              <div className="flex items-center gap-2 mb-4 text-destructive">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="h-10 px-5 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted transition-colors text-sm font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="h-10 px-5 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
