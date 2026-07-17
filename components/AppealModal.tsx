import { useState } from 'react';
import { ShieldAlert, ExternalLink, X, AlertTriangle } from 'lucide-react';

interface AppealModalProps {
  isOpen: boolean;
  contentKind: string;
  excerpt: string;
  reason: string;
  onConfirm: (justification: string) => void;
  onCancel: () => void;
}

export function AppealModal({
  isOpen,
  contentKind,
  excerpt,
  reason,
  onConfirm,
  onCancel,
}: AppealModalProps) {
  const [text, setText]   = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!text.trim()) {
      setError('Debes ingresar una justificación para enviar la apelación.');
      return;
    }
    onConfirm(text.trim());
    setText('');
    setError('');
  };

  const handleCancel = () => {
    setText('');
    setError('');
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl border border-border max-w-lg w-full mx-4 animate-in zoom-in-95 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold">Solicitar apelación</h2>
          </div>
          <button
            onClick={handleCancel}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Resumen del contenido */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Contenido ocultado ({contentKind})
            </p>
            <div className="bg-secondary rounded-lg p-3 border border-border">
              <p className="text-sm text-muted-foreground italic line-clamp-2">{excerpt}</p>
            </div>
          </div>

          {/* Motivo del ocultamiento */}
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-destructive mb-0.5">Motivo de moderación</p>
              <p className="text-sm text-red-700">{reason}</p>
            </div>
          </div>

          {/* Justificación */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Justificación de la apelación <span className="text-destructive">*</span>
            </label>
            <textarea
              value={text}
              onChange={(e) => { setText(e.target.value); setError(''); }}
              placeholder="Explica por qué consideras que tu contenido no incumple las normas de la comunidad."
              rows={4}
              maxLength={600}
              className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none transition-colors resize-none text-sm ${
                error ? 'border-destructive focus:border-destructive' : 'border-input focus:border-primary'
              }`}
            />
            <div className="flex items-center justify-between">
              {error
                ? <p className="text-sm text-destructive">{error}</p>
                : <span />
              }
              <p className="text-xs text-muted-foreground ml-auto">{text.length}/600</p>
            </div>
          </div>

          {/* Enlace normas */}
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Normas de la comunidad
          </button>
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
            onClick={handleSubmit}
            className="flex items-center gap-2 h-10 px-5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <ShieldAlert className="w-4 h-4" />
            Enviar apelación
          </button>
        </div>
      </div>
    </div>
  );
}
