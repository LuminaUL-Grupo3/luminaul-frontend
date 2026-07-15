import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Clock, Trash2, Eye, CalendarDays, ChevronRight } from 'lucide-react';
import { Toast } from '../components/Toast';

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

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const DIA_SHORT: Record<string, string> = {
  Lunes: 'Lun',
  Martes: 'Mar',
  Miércoles: 'Mié',
  Jueves: 'Jue',
  Viernes: 'Vie',
  Sábado: 'Sáb',
  Domingo: 'Dom',
};

const DIA_ORDER: Record<string, number> = {
  Lunes: 0, Martes: 1, Miércoles: 2, Jueves: 3,
  Viernes: 4, Sábado: 5, Domingo: 6,
};

// Datos pre-cargados simulando franjas ya registradas
const INITIAL_FRANJAS: Franja[] = [
  { id: 1, dia: 'Lunes',     inicio: '08:00', fin: '10:00' },
  { id: 2, dia: 'Martes',    inicio: '14:00', fin: '16:00' },
  { id: 3, dia: 'Miércoles', inicio: '09:00', fin: '11:00' },
  { id: 4, dia: 'Viernes',   inicio: '15:00', fin: '18:00' },
];

export function EditAvailabilityPage() {
  const navigate = useNavigate();

  // franjas en servidor (no cambian salvo guardado/eliminación confirmada)
  const [savedFranjas] = useState<Franja[]>(INITIAL_FRANJAS);

  // copia de trabajo que el usuario edita
  const [workingFranjas, setWorkingFranjas] = useState<Franja[]>(
    INITIAL_FRANJAS.map((f) => ({ ...f }))
  );

  // id de la franja que se está editando actualmente
  const [editingId, setEditingId] = useState<number | null>(null);

  // campos del formulario de edición inline
  const [editDia, setEditDia]       = useState('');
  const [editInicio, setEditInicio] = useState('');
  const [editFin, setEditFin]       = useState('');
  const [editError, setEditError]   = useState('');

  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  const sortedFranjas = [...workingFranjas].sort(
    (a, b) => DIA_ORDER[a.dia] - DIA_ORDER[b.dia] || a.inicio.localeCompare(b.inicio)
  );

  // Abre el formulario inline para una franja
  const openEdit = (f: Franja) => {
    setEditingId(f.id);
    setEditDia(f.dia);
    setEditInicio(f.inicio);
    setEditFin(f.fin);
    setEditError('');
  };

  // Descarta cambios en el formulario inline (cancela la edición, no la página)
  const cancelEdit = () => {
    // Restaura la franja a su valor pre-edición (desde workingFranjas original antes de abrir)
    const original = savedFranjas.find((f) => f.id === editingId);
    if (original) {
      setWorkingFranjas((prev) =>
        prev.map((f) => (f.id === editingId ? { ...original } : f))
      );
    }
    setEditingId(null);
    setEditError('');
  };

  // Confirma la edición inline en la lista de trabajo
  const applyEdit = () => {
    if (editInicio >= editFin) {
      setEditError('La hora de inicio debe ser anterior a la hora de fin.');
      return;
    }
    setEditError('');
    setWorkingFranjas((prev) =>
      prev.map((f) =>
        f.id === editingId
          ? { ...f, dia: editDia, inicio: editInicio, fin: editFin }
          : f
      )
    );
    setEditingId(null);
  };

  // Elimina una franja de la lista de trabajo
  const handleDelete = (id: number) => {
    setWorkingFranjas((prev) => prev.filter((f) => f.id !== id));
    if (editingId === id) setEditingId(null);
  };

  // Guarda todos los cambios y vuelve al perfil
  const handleSave = () => {
    setToast({ show: true, message: 'Horario actualizado correctamente.', type: 'success' });
    setTimeout(() => navigate('/perfil/disponibilidad'), 1800);
  };

  // Descarta todos los cambios de la página y vuelve
  const handleCancel = () => {
    navigate('/perfil/disponibilidad');
  };

  // Agrupar para la vista previa
  const byDay = DIAS.reduce<Record<string, Franja[]>>((acc, d) => {
    const items = workingFranjas.filter((f) => f.dia === d);
    if (items.length) acc[d] = items.sort((a, b) => a.inicio.localeCompare(b.inicio));
    return acc;
  }, {});

  return (
    <>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl mb-2">Editar disponibilidad horaria</h1>
          <p className="text-muted-foreground">
            Los cambios se reflejarán en tu perfil público al guardar
          </p>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
          <Eye className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            Selecciona cualquier franja para modificar el día o el rango horario. Los cambios no se guardan hasta que presiones <span className="font-medium">Guardar horario</span>.
          </p>
        </div>

        <div className="space-y-6">
          {/* Lista editable */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Franjas registradas</h3>
                <p className="text-sm text-muted-foreground">
                  Toca una franja para editarla
                </p>
              </div>
            </div>

            {sortedFranjas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mb-3">
                  <Clock className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">
                  No quedan franjas horarias registradas.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedFranjas.map((f) =>
                  editingId === f.id ? (
                    /* ── Formulario inline de edición ── */
                    <div
                      key={f.id}
                      className="rounded-xl border border-primary/40 bg-primary/5 p-4 space-y-4"
                    >
                      {/* Selector de día */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Día de la semana
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {DIAS.map((dia) => (
                            <button
                              key={dia}
                              type="button"
                              onClick={() => setEditDia(dia)}
                              className={`h-8 px-3 rounded-full text-xs font-medium border transition-colors ${
                                editDia === dia
                                  ? 'bg-primary text-primary-foreground border-primary'
                                  : 'bg-white text-foreground border-border hover:border-primary hover:text-primary'
                              }`}
                            >
                              {DIA_SHORT[dia]}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Hora inicio / fin */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="block text-sm font-medium text-foreground">
                            Hora de inicio
                          </label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            <input
                              type="time"
                              value={editInicio}
                              onChange={(e) => { setEditInicio(e.target.value); setEditError(''); }}
                              className={`w-full h-11 pl-10 pr-3 bg-white border rounded-lg focus:outline-none transition-colors ${
                                editError ? 'border-destructive' : 'border-input focus:border-primary'
                              }`}
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-sm font-medium text-foreground">
                            Hora de fin
                          </label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            <input
                              type="time"
                              value={editFin}
                              onChange={(e) => { setEditFin(e.target.value); setEditError(''); }}
                              className={`w-full h-11 pl-10 pr-3 bg-white border rounded-lg focus:outline-none transition-colors ${
                                editError ? 'border-destructive' : 'border-input focus:border-primary'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {editError && (
                        <p className="text-sm text-destructive">{editError}</p>
                      )}

                      {/* Acciones inline */}
                      <div className="flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={() => handleDelete(f.id)}
                          className="flex items-center gap-1.5 text-sm text-destructive hover:opacity-70 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar franja
                        </button>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="h-9 px-4 border border-border rounded-lg text-sm hover:border-foreground/30 transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={applyEdit}
                            className="h-9 px-4 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
                          >
                            Aplicar
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ── Fila normal ── */
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => openEdit(f)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-secondary rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-20 text-sm font-medium text-primary text-left">{f.dia}</span>
                        <div className="flex items-center gap-1.5 text-sm text-foreground">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          {f.inicio} – {f.fin}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* Vista previa */}
          {workingFranjas.length > 0 && (
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
                      Así verán otros estudiantes tu disponibilidad actualizada
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
                    {Object.entries(byDay).map(([dia, items]) => (
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

          {/* Acciones de página */}
          <div className="flex items-center justify-end gap-3 pb-8">
            <button
              type="button"
              onClick={handleCancel}
              className="h-12 px-6 border border-border rounded-lg hover:border-foreground/30 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="h-12 px-8 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Guardar horario
            </button>
          </div>
        </div>
      </div>

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
