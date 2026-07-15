import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Bot, ShieldCheck, ShieldAlert, ShieldX,
  FileText, MessageSquare, Star,
  ChevronDown, ChevronUp, Eye, EyeOff, RefreshCw, User,
} from 'lucide-react';
import { Toast } from '../components/Toast';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

type RiskLevel  = 'Bajo'  | 'Medio' | 'Alto';
type StatusType = 'Publicado' | 'En revisión' | 'Ocultado';
type ContentKind = 'Publicación' | 'Mensaje' | 'Reseña';

interface ModerationEntry {
  id: number;
  kind: ContentKind;
  author: string;
  excerpt: string;
  botResult: string;
  risk: RiskLevel;
  status: StatusType;
  date: string;
  authorNotified?: string;
}

const INITIAL_ENTRIES: ModerationEntry[] = [
  {
    id: 1,
    kind: 'Publicación',
    author: 'usuario_anonimo_32',
    excerpt: '"Este grupo es una pérdida de tiempo, todos son unos..."',
    botResult: 'Lenguaje ofensivo detectado por el bot.',
    risk: 'Alto',
    status: 'Ocultado',
    date: '29 jun 2025 · 10:14',
    authorNotified: 'Tu contenido fue ocultado por incumplir las normas de la comunidad.',
  },
  {
    id: 2,
    kind: 'Mensaje',
    author: 'Carlos Mendoza',
    excerpt: '"Hola, ¿podemos reunirnos el martes para repasar álgebra?"',
    botResult: 'No se detectaron infracciones.',
    risk: 'Bajo',
    status: 'Publicado',
    date: '29 jun 2025 · 09:52',
  },
  {
    id: 3,
    kind: 'Reseña',
    author: 'usuaria_345',
    excerpt: '"Mal asesor, no sé cómo tiene tantas reseñas positivas... probablemente falsas."',
    botResult: 'El contenido requiere validación por parte de un moderador.',
    risk: 'Medio',
    status: 'En revisión',
    date: '28 jun 2025 · 18:33',
    authorNotified: 'Tu contenido permanece oculto temporalmente mientras es revisado por un moderador.',
  },
  {
    id: 4,
    kind: 'Publicación',
    author: 'Ana Martínez',
    excerpt: '"Asesorías de Python disponibles esta semana, escribidme por chat."',
    botResult: 'No se detectaron infracciones.',
    risk: 'Bajo',
    status: 'Publicado',
    date: '28 jun 2025 · 14:21',
  },
  {
    id: 5,
    kind: 'Mensaje',
    author: 'usuario_nuevo_99',
    excerpt: '"Vendo apuntes de todos los cursos a precio especial $$$ contactar..."',
    botResult: 'Posible spam comercial detectado.',
    risk: 'Medio',
    status: 'En revisión',
    date: '27 jun 2025 · 22:07',
    authorNotified: 'Tu contenido permanece oculto temporalmente mientras es revisado por un moderador.',
  },
  {
    id: 6,
    kind: 'Reseña',
    author: 'Diego Huanca',
    excerpt: '"Excelente asesor, muy paciente y con dominio del tema."',
    botResult: 'No se detectaron infracciones.',
    risk: 'Bajo',
    status: 'Publicado',
    date: '27 jun 2025 · 11:45',
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const RISK_CONFIG: Record<RiskLevel, { label: string; cls: string; dot: string }> = {
  Bajo:  { label: 'Bajo',  cls: 'bg-green-50  text-green-700  border-green-200',  dot: 'bg-green-500'  },
  Medio: { label: 'Medio', cls: 'bg-amber-50  text-amber-700  border-amber-200',  dot: 'bg-amber-500'  },
  Alto:  { label: 'Alto',  cls: 'bg-red-50    text-red-700    border-red-200',    dot: 'bg-red-500'    },
};

const STATUS_CONFIG: Record<StatusType, { label: string; cls: string; dot: string; icon: React.ReactNode }> = {
  'Publicado':   { label: 'Publicado',   cls: 'bg-green-50  text-green-700  border-green-200',  dot: 'bg-green-500',  icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  'En revisión': { label: 'En revisión', cls: 'bg-amber-50  text-amber-700  border-amber-200',  dot: 'bg-amber-500',  icon: <Bot          className="w-3.5 h-3.5" /> },
  'Ocultado':    { label: 'Ocultado',    cls: 'bg-red-50    text-red-700    border-red-200',    dot: 'bg-red-500',    icon: <ShieldX      className="w-3.5 h-3.5" /> },
};

const KIND_ICON: Record<ContentKind, React.ReactNode> = {
  'Publicación': <FileText    className="w-4 h-4 text-muted-foreground" />,
  'Mensaje':     <MessageSquare className="w-4 h-4 text-muted-foreground" />,
  'Reseña':      <Star         className="w-4 h-4 text-muted-foreground" />,
};

function RiskChip({ risk }: { risk: RiskLevel }) {
  const c = RISK_CONFIG[risk];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
}

function StatusChip({ status }: { status: StatusType }) {
  const c = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${c.cls}`}>
      {c.icon}
      {c.label}
    </span>
  );
}

// ── Row expandible ────────────────────────────────────────────────────────────

function EntryRow({
  entry,
  onToggleStatus,
}: {
  entry: ModerationEntry;
  onToggleStatus: (id: number, newStatus: StatusType) => void;
}) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const nextStatus: StatusType =
    entry.status === 'Ocultado' ? 'Publicado'
    : entry.status === 'Publicado' ? 'Ocultado'
    : 'Publicado';

  const actionLabel = entry.status === 'Ocultado' ? 'Publicar' : 'Ocultar';
  const ActionIcon  = entry.status === 'Ocultado' ? Eye : EyeOff;

  return (
    <>
      <tr
        className="border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Tipo */}
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-2 text-sm">
            {KIND_ICON[entry.kind]}
            <span className="font-medium">{entry.kind}</span>
          </div>
        </td>
        {/* Autor */}
        <td className="px-4 py-3.5">
          <span className="text-sm text-foreground">{entry.author}</span>
        </td>
        {/* Fragmento */}
        <td className="px-4 py-3.5 max-w-xs">
          <span className="text-sm text-muted-foreground line-clamp-1">{entry.excerpt}</span>
        </td>
        {/* Resultado bot */}
        <td className="px-4 py-3.5 max-w-[180px]">
          <span className="text-sm text-muted-foreground line-clamp-1">{entry.botResult}</span>
        </td>
        {/* Riesgo */}
        <td className="px-4 py-3.5">
          <RiskChip risk={entry.risk} />
        </td>
        {/* Estado */}
        <td className="px-4 py-3.5">
          <StatusChip status={entry.status} />
        </td>
        {/* Fecha */}
        <td className="px-4 py-3.5">
          <span className="text-xs text-muted-foreground whitespace-nowrap">{entry.date}</span>
        </td>
        {/* Chevron */}
        <td className="px-4 py-3.5 text-muted-foreground">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </td>
      </tr>

      {/* Fila expandida */}
      {expanded && (
        <tr className="bg-secondary/30 border-b border-border">
          <td colSpan={8} className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Detalle bot */}
              <div className="bg-white rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <h4 className="text-sm font-semibold">Resultado del análisis</h4>
                </div>
                <p className="text-sm text-muted-foreground">{entry.botResult}</p>
                <div className="flex items-center gap-3">
                  <RiskChip risk={entry.risk} />
                  <StatusChip status={entry.status} />
                </div>
              </div>

              {/* Notificación al autor */}
              {entry.authorNotified && (
                <div className={`rounded-xl border p-4 space-y-2 ${
                  entry.risk === 'Alto'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className={`w-4 h-4 ${entry.risk === 'Alto' ? 'text-destructive' : 'text-amber-600'}`} />
                    <h4 className={`text-sm font-semibold ${entry.risk === 'Alto' ? 'text-destructive' : 'text-amber-800'}`}>
                      Notificación enviada al autor
                    </h4>
                  </div>
                  <p className={`text-sm ${entry.risk === 'Alto' ? 'text-red-700' : 'text-amber-700'}`}>
                    "{entry.authorNotified}"
                  </p>
                </div>
              )}
            </div>

            {/* Acción manual del moderador */}
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onToggleStatus(entry.id, nextStatus); }}
                className={`flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium transition-colors ${
                  entry.status === 'Ocultado'
                    ? 'border border-green-300 text-green-700 hover:bg-green-50'
                    : 'border border-red-300 text-red-700 hover:bg-red-50'
                }`}
              >
                <ActionIcon className="w-4 h-4" />
                {actionLabel} manualmente
              </button>
              {entry.status === 'En revisión' && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onToggleStatus(entry.id, 'Ocultado'); }}
                  className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium border border-red-300 text-red-700 hover:bg-red-50 transition-colors"
                >
                  <ShieldX className="w-4 h-4" />
                  Ocultar definitivamente
                </button>
              )}
              {entry.risk === 'Alto' && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); navigate(`/admin/usuarios/${entry.id}/suspension`); }}
                  className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium border border-destructive text-destructive hover:bg-red-50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Ver usuario
                </button>
              )}
              {entry.kind === 'Publicación' && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); navigate(`/admin/publicaciones/${entry.id}/reporte`); }}
                  className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Ver publicación
                </button>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type FilterStatus = 'Todos' | StatusType;

export function ModerationPage() {
  const [entries, setEntries]     = useState<ModerationEntry[]>(INITIAL_ENTRIES);
  const [filter, setFilter]       = useState<FilterStatus>('Todos');
  const [toast, setToast]         = useState<ToastState>({ show: false, message: '', type: 'success' });

  const approved  = entries.filter((e) => e.status === 'Publicado').length;
  const hidden    = entries.filter((e) => e.status === 'Ocultado').length;
  const reviewing = entries.filter((e) => e.status === 'En revisión').length;

  const displayed = filter === 'Todos' ? entries : entries.filter((e) => e.status === filter);

  const handleToggleStatus = (id: number, newStatus: StatusType) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
    );
    const labels: Record<StatusType, string> = {
      Publicado:    'Contenido publicado correctamente.',
      Ocultado:     'Contenido ocultado correctamente.',
      'En revisión': 'Contenido marcado para revisión.',
    };
    setToast({ show: true, message: labels[newStatus], type: 'success' });
  };

  const FILTER_TABS: { key: FilterStatus; label: string; count: number }[] = [
    { key: 'Todos',        label: 'Todos',        count: entries.length },
    { key: 'Publicado',    label: 'Publicados',    count: approved },
    { key: 'En revisión',  label: 'En revisión',   count: reviewing },
    { key: 'Ocultado',     label: 'Ocultados',     count: hidden },
  ];

  return (
    <>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-3xl">Moderación automática</h1>
            </div>
            <p className="text-muted-foreground ml-[52px]">
              Resultados del análisis del bot de moderación de contenido
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => navigate('/admin/usuarios/1/suspension')}
              className="flex items-center gap-2 h-10 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <User className="w-4 h-4" />
              Ver detalle de usuario reportado
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/publicaciones/1/reporte')}
              className="flex items-center gap-2 h-10 px-4 border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors text-sm font-medium"
            >
              <FileText className="w-4 h-4" />
              HU 7.2 — Ver publicación reportada
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/apelaciones')}
              className="flex items-center gap-2 h-10 px-4 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
            >
              <ShieldCheck className="w-4 h-4" />
              HU 7.3 — Panel de apelaciones
            </button>
            <button
              type="button"
              onClick={() => setToast({ show: true, message: 'Análisis de contenido actualizado.', type: 'success' })}
              className="flex items-center gap-2 h-10 px-4 border border-border rounded-lg hover:border-primary hover:text-primary transition-colors text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </div>
        </div>

        {/* Tarjetas resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {/* Aprobado */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contenido aprobado</p>
                <p className="text-3xl font-bold text-foreground">{approved}</p>
              </div>
            </div>
            <div className="mt-4 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: entries.length ? `${(approved / entries.length) * 100}%` : '0%' }}
              />
            </div>
          </div>

          {/* En revisión */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contenido en revisión</p>
                <p className="text-3xl font-bold text-foreground">{reviewing}</p>
              </div>
            </div>
            <div className="mt-4 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: entries.length ? `${(reviewing / entries.length) * 100}%` : '0%' }}
              />
            </div>
          </div>

          {/* Ocultado */}
          <div className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <ShieldX className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contenido ocultado</p>
                <p className="text-3xl font-bold text-foreground">{hidden}</p>
              </div>
            </div>
            <div className="mt-4 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all"
                style={{ width: entries.length ? `${(hidden / entries.length) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {/* Filtros */}
          <div className="flex items-center gap-1 px-4 pt-4 pb-0 border-b border-border overflow-x-auto">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap -mb-px ${
                  filter === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  filter === tab.key ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Tabla scroll */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  {['Tipo', 'Autor', 'Fragmento', 'Resultado del bot', 'Riesgo', 'Estado', 'Fecha', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center text-muted-foreground text-sm">
                      No hay contenido en esta categoría.
                    </td>
                  </tr>
                ) : (
                  displayed.map((entry) => (
                    <EntryRow
                      key={entry.id}
                      entry={entry}
                      onToggleStatus={handleToggleStatus}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border bg-secondary/30">
            <p className="text-xs text-muted-foreground">
              Mostrando {displayed.length} de {entries.length} registros · Última actualización: hoy a las 10:14
            </p>
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
