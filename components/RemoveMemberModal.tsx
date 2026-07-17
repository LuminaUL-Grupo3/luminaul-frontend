import { UserMinus, AlertTriangle } from 'lucide-react';

interface RemoveMemberModalProps {
  isOpen: boolean;
  memberName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function RemoveMemberModal({ isOpen, memberName, onConfirm, onCancel }: RemoveMemberModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl border border-border max-w-md w-full mx-4 p-8 animate-in zoom-in-95">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl mb-3">¿Deseas expulsar a este integrante?</h2>
          <p className="text-muted-foreground">
            <strong>{memberName}</strong> perderá acceso al grupo y al chat.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onConfirm}
            className="w-full flex items-center justify-center gap-2 h-12 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors font-medium"
          >
            <UserMinus className="w-5 h-5" />
            Expulsar
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
            Esta acción es permanente. El usuario deberá solicitar unirse nuevamente.
          </p>
        </div>
      </div>
    </div>
  );
}
