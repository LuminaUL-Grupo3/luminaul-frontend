import { Trash2, AlertTriangle } from 'lucide-react';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteAccountModal({ isOpen, onConfirm, onCancel }: DeleteAccountModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl border border-border max-w-md w-full mx-4 p-8 animate-in zoom-in-95">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl mb-3">¿Deseas eliminar tu cuenta?</h2>
          <p className="text-muted-foreground mb-4">
            Esta acción no se puede deshacer. Se eliminará permanentemente:
          </p>
          <ul className="text-sm text-muted-foreground text-left space-y-2 bg-red-50 border border-red-200 rounded-lg p-4">
            <li className="flex gap-2">
              <span>•</span>
              <span>Tu perfil y toda tu información personal</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Todas tus publicaciones y comentarios</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Tu membresía en todos los grupos</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Todo tu historial de conversaciones</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={onConfirm}
            className="w-full flex items-center justify-center gap-2 h-12 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors font-medium"
          >
            <Trash2 className="w-5 h-5" />
            Eliminar definitivamente
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
            Una vez eliminada tu cuenta, no podrás recuperar tu información
          </p>
        </div>
      </div>
    </div>
  );
}
