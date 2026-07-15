import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Clock, Trash2, Eye, CalendarDays } from 'lucide-react';
import { Toast } from '../components/Toast';
import { DeleteFranjaModal } from '../components/DeleteFranjaModal';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

interface Franja {
  id: number;
  dia: string;
  inicio: string;
  fin: string;
}

const DIA_ORDER: Record<string, number> = {
  Lunes: 0, Martes: 1, Miércoles: 2, Jueves: 3,
  Viernes: 4, Sábado: 5, Domingo: 6,
};

// Datos simulados de franjas previamente registradas
const INITIAL_FRANJAS: Franja[] = [
  { id: 1, dia: 'Lunes',     inicio: '08:00', fin: '10:00' },
  { id: 2, dia: 'Martes',    inicio: '14:00', fin: '16:00' },
  { id: 3, dia: 'Miércoles', inicio: '09:00', fin: '11:00' },
  { id: 4, dia: 'Viernes',   inicio: '15:00', fin: '18:00' },
];

export function DeleteAvailabilityPage() {
  const navigate = useNavigate();

  const [franjas, setFranjas] = useState<Franja[]>(INITIAL_FRANJAS);
  const [pendingDelete, setPendingDelete] = useState<Franja | null>(null);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });
  const [showPreview, setShowPreview] = useState(false);

  const sortedFranjas = [...franjas].sort(
    (a, b) => DIA_ORDER[a.dia] - DIA_ORDER[b.dia] || a.inicio.localeCompare(b.inicio)
  );

  const handleDeleteRequest = (f: Franja) => setPendingDelete(f);

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    setFranjas((prev) => prev.filter((f) => f.id !== pendingDelete.id));
    setPendingDelete(null);
    setToast({ show: true, message: 'Horario eliminado correctamente.', type: 'success' });
  };

  const handleCancelDelete = () => setPendingDelete(null);

  // Agrupar para la vista previa
  const byDay = Object.entries(
    sortedFranjas.reduce<Record<string, Franja[]>>((acc, f) => {
      (acc[f.dia] ??= []).push(f);
      return acc;
    }, {})
  );

  return (
    <>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl mb-2">Disponibilidad horaria</h1>
          <p className="text-muted-foreground">
            Elimina las franjas que ya no correspondan a tu horario actual
          </p>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <Trash2 className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            Al eliminar una franja, tu disponibilidad en el perfil público se actualizará de inmediato. Esta acción <span className="font-medium">no se puede deshacer</span>.
          </p>
        </div>

        <div className="space-y-6">
          {/* Lista de franjas */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium">Franjas registradas</h3>
                <p className="text-sm text-muted-foreground">
                  Presiona el icono de papelera para eliminar una franja
                </p>
              </div>
              {franjas.length > 0 && (
                <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium self-start">
                  {franjas.length} {franjas.length === 1 ? 'franja' : 'franjas'}
                </span>
              )}
            </div>

            {sortedFranjas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mb-3">
                  <Clock className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">
                  No tienes franjas horarias registradas.
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Puedes agregar nuevas franjas desde la sección de disponibilidad.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedFranjas.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between px-4 py-3 bg-secondary rounded-lg border border-border group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-20 text-sm font-medium text-primary">{f.dia}</span>
                      <div className="flex items-center gap-1.5 text-sm text-foreground">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        {f.inicio} – {f.fin}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteRequest(f)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      aria-label={`Eliminar franja ${f.dia} ${f.inicio}–${f.fin}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vista previa */}
          {franjas.length > 0 && (
            <div className="bg-white rounded-xl border border-border p-6">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="w-full flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Eye className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-medium group-hover:text-primary transition-colors">
                      Vista previa del perfil
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Así ven otros estudiantes tu disponibilidad actual
                    </p>
                  </div>
                </div>
                <span className="text-sm text-primary font-medium">
                  {showPreview ? 'Ocultar' : 'Ver'}
                </span>
              </button>

              {showPreview && (
                <div className="mt-5 pt-5 border-t border-border">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                    Disponibilidad semanal
                  </p>
                  <div className="space-y-3">
                    {byDay.map(([dia, items]) => (
                      <div key={dia} className="flex items-start gap-4">
                        <span className="w-20 text-sm font-medium text-foreground pt-0.5">{dia}</span>
                        <div className="flex flex-wrap gap-2">
                          {items.map((item) => (
                            <span
                              key={item.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium"
                            >
                              <Clock className="w-3 h-3" />
                              {item.inicio} – {item.fin}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Acción de volver */}
          <div className="flex justify-end pb-8">
            <button
              type="button"
              onClick={() => navigate('/perfil/disponibilidad')}
              className="h-12 px-8 border border-border rounded-lg hover:border-foreground/30 transition-colors font-medium"
            >
              Volver
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {pendingDelete && (
        <DeleteFranjaModal
          isOpen={!!pendingDelete}
          dia={pendingDelete.dia}
          inicio={pendingDelete.inicio}
          fin={pendingDelete.fin}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((p) => ({ ...p, show: false }))}
        />
      )}
    </>
  );
}
