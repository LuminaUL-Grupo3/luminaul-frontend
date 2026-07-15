import { useState } from 'react';
import { ShieldX, AlertTriangle, X } from 'lucide-react';

export type SuspensionType = 'temporal' | 'permanent';
export type SuspensionDuration = '3' | '7' | '30' | 'custom';

export interface SuspensionData {
  type: SuspensionType;
  duration?: SuspensionDuration;
  customDays?: number;
  reason: string;
}

interface SuspendUserModalProps {
  isOpen: boolean;
  userName: string;
  onConfirm: (data: SuspensionData) => void;
  onCancel: () => void;
}

const DURATION_LABELS: Record<SuspensionDuration, string> = {
  '3': '3 días',
  '7': '7 días',
  '30': '30 días',
  'custom': 'Personalizado',
};

export function SuspendUserModal({ isOpen, userName, onConfirm, onCancel }: SuspendUserModalProps) {
  const [type, setType]               = useState<SuspensionType>('temporal');
  const [duration, setDuration]       = useState<SuspensionDuration>('7');
  const [customDays, setCustomDays]   = useState<number>(14);
  const [reason, setReason]           = useState('');
  const [errors, setErrors]           = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const next: Record<string, string> = {};
    if (!reason.trim()) next.reason = 'El motivo de la suspensión es obligatorio.';
    if (type === 'temporal' && duration === 'custom' && (!customDays || customDays < 1)) {
      next.custom = 'Ingresa un número de días válido (mínimo 1).';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    onConfirm({ type, duration: type === 'temporal' ? duration : undefined, customDays: duration === 'custom' ? customDays : undefined, reason });
    // reset
    setType('temporal'); setDuration('7'); setCustomDays(14); setReason(''); setErrors({});
  };

  const handleCancel = () => {
    setType('temporal'); setDuration('7'); setCustomDays(14); setReason(''); setErrors({});
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl border border-border max-w-lg w-full mx-4 animate-in zoom-in-95 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
              <ShieldX className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-semibold leading-tight">Suspender cuenta</h2>
              <p className="text-xs text-muted-foreground">{userName}</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Tipo de suspensión */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Tipo de suspensión <span className="text-destructive">*</span></p>
            <div className="space-y-2">
              {(['temporal', 'permanent'] as SuspensionType[]).map((t) => (
                <label
                  key={t}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    type === t
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40 hover:bg-secondary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="suspension-type"
                    value={t}
                    checked={type === t}
                    onChange={() => setType(t)}
                    className="accent-primary w-4 h-4 flex-shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t === 'temporal' ? 'Suspensión temporal' : 'Suspensión permanente'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t === 'temporal'
                        ? 'El usuario podrá volver a acceder al finalizar el período'
                        : 'El usuario no podrá acceder a la plataforma indefinidamente'}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Duración — solo si temporal */}
          {type === 'temporal' && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Duración <span className="text-destructive">*</span></p>
              <div className="grid grid-cols-2 gap-2">
                {(['3', '7', '30', 'custom'] as SuspensionDuration[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDuration(d)}
                    className={`h-10 rounded-lg border text-sm font-medium transition-colors ${
                      duration === d
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-white text-foreground border-border hover:border-primary hover:text-primary'
                    }`}
                  >
                    {DURATION_LABELS[d]}
                  </button>
                ))}
              </div>

              {duration === 'custom' && (
                <div className="space-y-1.5">
                  <label className="block text-sm text-muted-foreground">Número de días</label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={customDays}
                    onChange={(e) => { setCustomDays(Number(e.target.value)); setErrors((p) => ({ ...p, custom: '' })); }}
                    className={`w-full h-11 px-4 bg-white border rounded-lg focus:outline-none transition-colors ${
                      errors.custom ? 'border-destructive' : 'border-input focus:border-primary'
                    }`}
                  />
                  {errors.custom && <p className="text-sm text-destructive">{errors.custom}</p>}
                </div>
              )}
            </div>
          )}

          {/* Motivo */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Motivo de la suspensión <span className="text-destructive">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => { setReason(e.target.value); setErrors((p) => ({ ...p, reason: '' })); }}
              placeholder="Describe el motivo por el cual se suspende esta cuenta..."
              rows={4}
              maxLength={500}
              className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none transition-colors resize-none text-sm ${
                errors.reason ? 'border-destructive' : 'border-input focus:border-primary'
              }`}
            />
            <div className="flex items-center justify-between">
              {errors.reason
                ? <p className="text-sm text-destructive">{errors.reason}</p>
                : <span />}
              <p className="text-xs text-muted-foreground ml-auto">{reason.length}/500</p>
            </div>
          </div>

          {/* Warning permanente */}
          {type === 'permanent' && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">
                Esta acción es permanente. El usuario no podrá recuperar el acceso a su cuenta.
              </p>
            </div>
          )}
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
            <ShieldX className="w-4 h-4" />
            Confirmar suspensión
          </button>
        </div>
      </div>
    </div>
  );
}
