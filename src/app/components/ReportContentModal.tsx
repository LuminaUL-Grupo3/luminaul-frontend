import { useState } from 'react';
import { Flag, AlertTriangle, CheckCircle2 } from 'lucide-react';

export type ReportContentType = 'publicación' | 'mensaje' | 'reseña';

interface ReportContentModalProps {
  isOpen: boolean;
  contentType: ReportContentType;
  alreadyReported?: boolean;
  onConfirm: (reason: string, detail?: string) => void;
  onCancel: () => void;
}

const MOTIVOS = [
  'Lenguaje ofensivo',
  'Acoso o bullying',
  'Spam',
  'Información falsa',
  'Contenido inapropiado',
  'Otro',
] as const;

export function ReportContentModal({
  isOpen,
  contentType,
  alreadyReported = false,
  onConfirm,
  onCancel,
}: ReportContentModalProps) {
  const [selected, setSelected] = useState('');
  const [detail, setDetail]     = useState('');
  const [error, setError]       = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selected) {
      setError('Selecciona un motivo para continuar.');
      return;
    }
    onConfirm(selected, selected === 'Otro' ? detail : undefined);
    // reset
    setSelected('');
    setDetail('');
    setError('');
  };

  const handleCancel = () => {
    setSelected('');
    setDetail('');
    setError('');
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl border border-border max-w-md w-full mx-4 p-8 animate-in zoom-in-95">

        {/* Header */}
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            alreadyReported ? 'bg-secondary' : 'bg-amber-50'
          }`}>
            {alreadyReported
              ? <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
              : <Flag className="w-8 h-8 text-amber-500" />
            }
          </div>

          <h2 className="text-2xl mb-2">Reportar contenido</h2>

          {alreadyReported ? (
            <div className="flex items-start gap-2 bg-secondary border border-border rounded-lg p-3 text-left mt-3">
              <AlertTriangle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Ya reportaste este contenido anteriormente.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Ayúdanos a mantener una comunidad segura. Selecciona el motivo del reporte.
            </p>
          )}
        </div>

        {/* Motivos — deshabilitados si ya fue reportado */}
        {!alreadyReported && (
          <div className="space-y-2 mb-5">
            {MOTIVOS.map((motivo) => (
              <label
                key={motivo}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selected === motivo
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40 hover:bg-secondary/50'
                }`}
              >
                <input
                  type="radio"
                  name="motivo"
                  value={motivo}
                  checked={selected === motivo}
                  onChange={() => {
                    setSelected(motivo);
                    setError('');
                  }}
                  className="accent-primary w-4 h-4 flex-shrink-0"
                />
                <span className="text-sm text-foreground">{motivo}</span>
              </label>
            ))}

            {/* Campo adicional para "Otro" */}
            {selected === 'Otro' && (
              <div className="mt-1">
                <textarea
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  placeholder="Describe brevemente el problema (opcional)..."
                  rows={3}
                  maxLength={300}
                  className="w-full px-4 py-3 bg-white border border-input rounded-lg focus:border-primary focus:outline-none transition-colors resize-none text-sm"
                />
                <p className="text-xs text-muted-foreground text-right mt-1">{detail.length}/300</p>
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive pt-1">{error}</p>
            )}
          </div>
        )}

        {/* Tipo de contenido reportado */}
        {!alreadyReported && (
          <p className="text-xs text-muted-foreground mb-5 text-center">
            Estás reportando una <span className="font-medium">{contentType}</span>.
            Nuestro equipo revisará el contenido.
          </p>
        )}

        {/* Botones */}
        <div className="space-y-3">
          {alreadyReported ? (
            <button
              onClick={handleCancel}
              className="w-full h-12 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted transition-colors font-medium"
            >
              Cerrar
            </button>
          ) : (
            <>
              <button
                onClick={handleSubmit}
                className="w-full flex items-center justify-center gap-2 h-12 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <Flag className="w-4 h-4" />
                Enviar reporte
              </button>
              <button
                onClick={handleCancel}
                className="w-full h-12 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted transition-colors font-medium"
              >
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
