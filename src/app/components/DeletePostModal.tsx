import { useState } from 'react';
import { Trash2, AlertTriangle, X, User, Calendar, Flag, FileText } from 'lucide-react';

interface DeletePostModalProps {
  isOpen: boolean;
  author: string;
  date: string;
  mainReason: string;
  reportCount: number;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export function DeletePostModal({
  isOpen,
  author,
  date,
  mainReason,
  reportCount,
  onConfirm,
  onCancel,
}: DeletePostModalProps) {
  const [reason, setReason] = useState('');
  const [error,  setError]  = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('El motivo de eliminación es obligatorio.');
      return;
    }
    onConfirm(reason.trim());
    setReason('');
    setError('');
  };

  const handleCancel = () => {
    setReason('');
    setError('');
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl border border-border max-w-lg w-full mx-4 animate-in zoom-in-95 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold">¿Deseas eliminar esta publicación?</h2>
          </div>
          <button
            onClick={handleCancel}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Descripción */}
          <p className="text-sm text-muted-foreground">
            Esta acción retirará el contenido del feed público y notificará al autor. La acción quedará registrada en el historial de moderación.
          </p>

          {/* Resumen */}
          <div className="bg-secondary rounded-xl border border-border divide-y divide-border">
            {[
              { icon: <User     className="w-4 h-4 text-muted-foreground" />, label: 'Autor',              value: author                              },
              { icon: <Calendar className="w-4 h-4 text-muted-foreground" />, label: 'Fecha',              value: date                                },
              { icon: <Flag     className="w-4 h-4 text-muted-foreground" />, label: 'Motivo principal',   value: mainReason                          },
              { icon: <FileText className="w-4 h-4 text-muted-foreground" />, label: 'Número de reportes', value: `${reportCount} reportes confirmados` },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-3 px-4 py-3">
                {row.icon}
                <span className="text-xs text-muted-foreground w-32 flex-shrink-0">{row.label}</span>
                <span className="text-sm font-medium text-foreground">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Motivo de eliminación */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Motivo de eliminación <span className="text-destructive">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => { setReason(e.target.value); setError(''); }}
              placeholder="Describe el motivo por el cual se elimina esta publicación..."
              rows={3}
              maxLength={500}
              className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none transition-colors resize-none text-sm ${
                error ? 'border-destructive' : 'border-input focus:border-primary'
              }`}
            />
            <div className="flex items-center justify-between">
              {error
                ? <p className="text-sm text-destructive">{error}</p>
                : <span />}
              <p className="text-xs text-muted-foreground ml-auto">{reason.length}/500</p>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">
              Esta acción es irreversible. El autor recibirá una notificación con el motivo de la eliminación.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            className="h-10 px-5 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 h-10 px-5 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Confirmar eliminación
          </button>
        </div>
      </div>
    </div>
  );
}
