import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Clock, Plus, Trash2, Eye, CalendarDays, Pencil, Trash } from 'lucide-react';
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

let nextId = 1;

export function AvailabilityPage() {
  const navigate = useNavigate();

  const [selectedDia, setSelectedDia] = useState('Lunes');
  const [inicio, setInicio] = useState('08:00');
  const [fin, setFin] = useState('10:00');
  const [franjas, setFranjas] = useState<Franja[]>([]);
  const [inputError, setInputError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  const handleAdd = () => {
    if (inicio >= fin) {
      setInputError('La hora de inicio debe ser anterior a la hora de fin.');
      return;
    }
    setInputError('');
    setFranjas((prev) => [
      ...prev,
      { id: nextId++, dia: selectedDia, inicio, fin },
    ]);
  };

  const handleRemove = (id: number) => {
    setFranjas((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSave = () => {
    setToast({ show: true, message: 'Horario guardado correctamente.', type: 'success' });
    setTimeout(() => navigate('/perfil'), 1800);
  };

  const sortedFranjas = [...franjas].sort(
    (a, b) => DIA_ORDER[a.dia] - DIA_ORDER[b.dia] || a.inicio.localeCompare(b.inicio)
  );

  // Group by day for preview
  const byDay = DIAS.reduce<Record<string, Franja[]>>((acc, d) => {
    const items = franjas.filter((f) => f.dia === d);
    if (items.length) acc[d] = items.sort((a, b) => a.inicio.localeCompare(b.inicio));
    return acc;
  }, {});

  return (
    <>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl mb-2">Disponibilidad horaria</h1>
          <p className="text-muted-foreground">
            Registra tus horas libres para coordinar sesiones de estudio con otros estudiantes
          </p>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
          <Eye className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            Tu disponibilidad será visible para otros estudiantes en tu perfil público, facilitando la coordinación de grupos de estudio.
          </p>
        </div>

        <div className="space-y-6">
          {/* Agregar franja */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Agregar franja horaria</h3>
                <p className="text-sm text-muted-foreground">Selecciona el día y el rango de tiempo disponible</p>
              </div>
            </div>

            {/* Días de la semana */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-foreground mb-2">Día de la semana</label>
              <div className="flex flex-wrap gap-2">
                {DIAS.map((dia) => (
                  <button
                    key={dia}
                    type="button"
                    onClick={() => setSelectedDia(dia)}
                    className={`h-9 px-4 rounded-full text-sm font-medium border transition-colors ${
                      selectedDia === dia
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
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Hora de inicio</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="time"
                    value={inicio}
                    onChange={(e) => {
                      setInicio(e.target.value);
                      setInputError('');
                    }}
                    className={`w-full h-12 pl-10 pr-4 bg-white border rounded-lg focus:outline-none transition-colors ${
                      inputError ? 'border-destructive focus:border-destructive' : 'border-input focus:border-primary'
                    }`}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Hora de fin</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="time"
                    value={fin}
                    onChange={(e) => {
                      setFin(e.target.value);
                      setInputError('');
                    }}
                    className={`w-full h-12 pl-10 pr-4 bg-white border rounded-lg focus:outline-none transition-colors ${
                      inputError ? 'border-destructive focus:border-destructive' : 'border-input focus:border-primary'
                    }`}
                  />
                </div>
              </div>
            </div>

            {inputError && (
              <p className="text-sm text-destructive mb-4">{inputError}</p>
            )}

            <button
              type="button"
              onClick={handleAdd}
              className="flex items-center gap-2 h-10 px-5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Agregar franja horaria
            </button>
          </div>

          {/* Lista de franjas agregadas */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Franjas agregadas</h3>
              {franjas.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                    {franjas.length} {franjas.length === 1 ? 'franja' : 'franjas'}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate('/perfil/disponibilidad/editar')}
                    className="flex items-center gap-1.5 text-xs text-primary hover:opacity-70 transition-opacity font-medium"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/perfil/disponibilidad/eliminar')}
                    className="flex items-center gap-1.5 text-xs text-destructive hover:opacity-70 transition-opacity font-medium"
                  >
                    <Trash className="w-3.5 h-3.5" />
                    Eliminar
                  </button>
                </div>
              )}
            </div>

            {sortedFranjas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mb-3">
                  <Clock className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Aún no has agregado ninguna franja horaria.
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Selecciona un día y un rango de horas para comenzar.
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
                      <span className="w-16 text-sm font-medium text-primary">{f.dia}</span>
                      <div className="flex items-center gap-1.5 text-sm text-foreground">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        {f.inicio} – {f.fin}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(f.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
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
                      Así verán otros estudiantes tu disponibilidad
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
                          {items.map((f) => (
                            <span
                              key={f.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium"
                            >
                              <Clock className="w-3 h-3" />
                              {f.inicio} – {f.fin}
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

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 pb-8">
            <button
              type="button"
              onClick={() => navigate('/perfil')}
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
