import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  ShieldCheck, ShieldAlert, Clock, XCircle, CheckCircle2,
  FileText, MessageSquare, Star,
  User, Bot, Flag, Search, RefreshCw,
  Filter, ArrowUpDown, ExternalLink, MessageCircle,
} from 'lucide-react';
import { Toast } from '../components/Toast';

interface ToastState { show: boolean; message: string; type: 'success' | 'error'; }

type ContentKind   = 'Publicación' | 'Mensaje' | 'Reseña';
type AppealStatus  = 'Pendiente'   | 'Aprobada' | 'Rechazada';
type SortMode      = 'recientes'   | 'antiguos';

interface AppealRow {
  id: number;
  kind: ContentKind;
  studentName: string;
  excerpt: string;
  justification: string;
  date: string;
  status: AppealStatus;
  resolvedBy?: string;
  resolvedDate?: string;
}

const ALL_APPEALS: AppealRow[] = [
  {
    id: 1,
    kind: 'Publicación',
    studentName: 'usuario_anonimo_32',
    excerpt: '"Este grupo es una pérdida de tiempo, todos son unos..."',
    justification: 'Mi publicación expresa una opinión crítica pero no contiene insultos directos. Simplemente describí mi experiencia negativa con el grupo.',
    date: '30 jun 2025',
    status: 'Pendiente',
  },
  {
    id: 2,
    kind: 'Reseña',
    studentName: 'usuaria_345',
    excerpt: '"Mal asesor, probablemente las reseñas positivas son falsas."',
    justification: 'Mi reseña refleja mi experiencia real. Tengo derecho a opinar sobre el servicio recibido. No afirmo nada como hecho, solo comparto mi sospecha personal.',
    date: '29 jun 2025',
    status: 'Pendiente',
  },
  {
    id: 3,
    kind: 'Mensaje',
    studentName: 'usuario_nuevo_99',
    excerpt: '"Vendo apuntes de todos los cursos a precio especial $$$..."',
    justification: 'No tengo ánimo de lucro, solo quería compartir mis apuntes con compañeros que los necesiten. El precio es simbólico para cubrir el costo de impresión.',
    date: '28 jun 2025',
    status: 'Rechazada',
    resolvedBy: 'Admin LuminaUL',
    resolvedDate: '29 jun 2025',
  },
  {
    id: 4,
    kind: 'Publicación',
    studentName: 'carlos_m_2024',
    excerpt: '"Nadie en este grupo sabe estudiar, son todos unos inútiles."',
    justification: 'Estaba frustrado en ese momento pero no pretendía ofender a nadie en particular. Fue un comentario general y lo retiro.',
    date: '25 jun 2025',
    status: 'Aprobada',
    resolvedBy: 'Admin LuminaUL',
    resolvedDate: '27 jun 2025',
  },
  {
    id: 5,
    kind: 'Reseña',
    studentName: 'estudiante_499',
    excerpt: '"Este asesor cobra y no enseña nada, es un fraude total."',
    justification: 'Pagué por una sesión y el asesor no se preparó. Mi comentario es válido como crítica constructiva al servicio.',
    date: '20 jun 2025',
    status: 'Rechazada',
    resolvedBy: 'Admin LuminaUL',
    resolvedDate: '22 jun 2025',
  },
  {
    id: 6,
    kind: 'Mensaje',
    studentName: 'anon_user_881',
    excerpt: '"Hagan la tarea por mí o les digo al profe que copiaron."',
    justification: 'Fue una broma interna entre amigos dentro del grupo. Todos conocían el contexto y nadie se sintió amenazado.',
    date: '18 jun 2025',
    status: 'Aprobada',
    resolvedBy: 'Admin LuminaUL',
    resolvedDate: '20 jun 2025',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const KIND_ICON: Record<ContentKind, React.ReactNode> = {
  'Publicación': <FileText      className="w-4 h-4" />,
  'Mensaje':     <MessageSquare className="w-4 h-4" />,
  'Reseña':      <Star          className="w-4 h-4" />,
};

type StatusCfg = { cls: string; dot: string; icon: React.ReactNode; label: string };
const STATUS_CFG: Record<AppealStatus, StatusCfg> = {
  'Pendiente': { cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', icon: <Clock        className="w-3.5 h-3.5" />, label: 'Pendiente' },
  'Aprobada':  { cls: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500', icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'Aprobada'  },
  'Rechazada': { cls: 'bg-red-50   text-red-700   border-red-200',   dot: 'bg-red-500',   icon: <XCircle      className="w-3.5 h-3.5" />, label: 'Rechazada' },
};

function StatusChip({ status }: { status: AppealStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${c.cls}`}>
      {c.icon}
      {c.label}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type KindFilter   = 'Todos' | ContentKind;
type StatusFilter = 'Todos' | AppealStatus;

export function AppealHistoryPage() {
  const navigate = useNavigate();

  const [search,       setSearch]       = useState('');
  const [kindFilter,   setKindFilter]   = useState<KindFilter>('Todos');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Todos');
  const [dateFrom,     setDateFrom]     = useState('');
  const [dateTo,       setDateTo]       = useState('');
  const [sortMode,     setSortMode]     = useState<SortMode>('recientes');
  const [showFilters,  setShowFilters]  = useState(false);
  const [toast,        setToast]        = useState<ToastState>({ show: false, message: '', type: 'success' });

  const pending   = ALL_APPEALS.filter((a) => a.status === 'Pendiente').length;
  const approved  = ALL_APPEALS.filter((a) => a.status === 'Aprobada').length;
  const rejected  = ALL_APPEALS.filter((a) => a.status === 'Rechazada').length;
  const botTotal  = 8; // referencia al total de contenidos moderados automáticamente

  const displayed = useMemo(() => {
    let rows = [...ALL_APPEALS];
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((r) =>
        r.studentName.toLowerCase().includes(q) ||
        r.excerpt.toLowerCase().includes(q) ||
        r.justification.toLowerCase().includes(q)
      );
    }
    if (kindFilter   !== 'Todos') rows = rows.filter((r) => r.kind   === kindFilter);
    if (statusFilter !== 'Todos') rows = rows.filter((r) => r.status === statusFilter);
    if (sortMode === 'antiguos')  rows.reverse();
    return rows;
  }, [search, kindFilter, statusFilter, sortMode]);

  const hasFilters = search || kindFilter !== 'Todos' || statusFilter !== 'Todos';

  const clearFilters = () => {
    setSearch(''); setKindFilter('Todos'); setStatusFilter('Todos');
    setDateFrom(''); setDateTo('');
  };

  const summaryCards = [
    { icon: <Clock        className="w-6 h-6 text-amber-600" />, bg: 'bg-amber-100', bar: 'bg-amber-500', label: 'Apelaciones pendientes',             value: pending,  total: ALL_APPEALS.length },
    { icon: <CheckCircle2 className="w-6 h-6 text-green-600" />, bg: 'bg-green-100', bar: 'bg-green-500', label: 'Apelaciones aprobadas',              value: approved, total: ALL_APPEALS.length },
    { icon: <XCircle      className="w-6 h-6 text-destructive"/>, bg: 'bg-red-100',  bar: 'bg-red-500',   label: 'Apelaciones rechazadas',             value: rejected, total: ALL_APPEALS.length },
    { icon: <Bot          className="w-6 h-6 text-blue-600"  />, bg: 'bg-blue-100', bar: 'bg-blue-500',  label: 'Contenidos moderados automáticamente', value: botTotal, total: botTotal            },
  ];

  return (
    <>
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-3xl">Historial de apelaciones</h1>
            </div>
            <p className="text-muted-foreground ml-[52px]">
              Seguimiento completo de todas las apelaciones enviadas por estudiantes
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => navigate('/admin/reportes')}
              className="flex items-center gap-1.5 h-9 px-3 border border-border rounded-lg hover:border-primary hover:text-primary transition-colors text-sm"
            >
              <Flag className="w-4 h-4" />
              Reportes
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/apelaciones')}
              className="flex items-center gap-1.5 h-9 px-3 border border-border rounded-lg hover:border-primary hover:text-primary transition-colors text-sm"
            >
              <ShieldAlert className="w-4 h-4" />
              Revisar pendientes
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/moderacion')}
              className="flex items-center gap-1.5 h-9 px-3 border border-border rounded-lg hover:border-primary hover:text-primary transition-colors text-sm"
            >
              <Bot className="w-4 h-4" />
              Moderación
            </button>
            <button
              type="button"
              onClick={() => setToast({ show: true, message: 'Historial de apelaciones actualizado.', type: 'success' })}
              className="flex items-center gap-1.5 h-9 px-3 border border-border rounded-lg hover:border-primary hover:text-primary transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </div>
        </div>

        {/* ── Tarjetas resumen ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {summaryCards.map((c) => (
            <div key={c.label} className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-11 h-11 ${c.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                  {c.icon}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground leading-tight">{c.label}</p>
                  <p className="text-2xl font-bold leading-tight">{c.value}</p>
                </div>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full ${c.bar} rounded-full transition-all`}
                  style={{ width: c.total > 0 ? `${Math.min((c.value / c.total) * 100, 100)}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── Barra de búsqueda y filtros ── */}
        <div className="bg-white rounded-xl border border-border p-4 mb-6 space-y-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por usuario, contenido o justificación..."
                className="w-full h-10 pl-9 pr-4 bg-secondary rounded-lg border border-transparent focus:border-primary focus:outline-none transition-colors text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-1.5 h-10 px-4 rounded-lg border text-sm font-medium transition-colors ${
                showFilters || hasFilters
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:border-primary hover:text-primary'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtros
              {hasFilters && <span className="w-2 h-2 bg-primary rounded-full" />}
            </button>
            <div className="relative">
              <select
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as SortMode)}
                className="h-10 pl-3 pr-8 border border-border rounded-lg text-sm focus:border-primary focus:outline-none appearance-none bg-white"
              >
                <option value="recientes">Más recientes</option>
                <option value="antiguos">Más antiguos</option>
              </select>
              <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {showFilters && (
            <div className="flex items-center gap-3 flex-wrap pt-1 border-t border-border">
              {/* Tipo */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-medium text-muted-foreground">Tipo:</span>
                {(['Todos', 'Publicación', 'Mensaje', 'Reseña'] as KindFilter[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKindFilter(k)}
                    className={`h-7 px-3 rounded-full text-xs font-medium border transition-colors ${
                      kindFilter === k
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-white text-foreground border-border hover:border-primary hover:text-primary'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>

              <div className="w-px h-5 bg-border" />

              {/* Estado */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-medium text-muted-foreground">Estado:</span>
                {(['Todos', 'Pendiente', 'Aprobada', 'Rechazada'] as StatusFilter[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`h-7 px-3 rounded-full text-xs font-medium border transition-colors ${
                      statusFilter === s
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-white text-foreground border-border hover:border-primary hover:text-primary'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="w-px h-5 bg-border" />

              {/* Fechas */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Desde:</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-7 px-2 text-xs border border-border rounded-lg focus:border-primary focus:outline-none"
                />
                <span className="text-xs text-muted-foreground">–</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-7 px-2 text-xs border border-border rounded-lg focus:border-primary focus:outline-none"
                />
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-destructive hover:opacity-70 transition-opacity ml-auto"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Tabla ── */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando <span className="font-semibold text-foreground">{displayed.length}</span> de{' '}
              <span className="font-semibold text-foreground">{ALL_APPEALS.length}</span> apelaciones
            </p>
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="text-xs text-primary hover:opacity-70">
                Limpiar filtros
              </button>
            )}
          </div>

          {displayed.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center px-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">
                {hasFilters ? 'Sin resultados' : 'No hay apelaciones registradas'}
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mb-6">
                {hasFilters
                  ? 'Ninguna apelación coincide con los filtros seleccionados.'
                  : 'Las apelaciones enviadas por los estudiantes aparecerán aquí para su seguimiento.'}
              </p>
              {hasFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-10 px-6 border border-border rounded-lg hover:border-primary hover:text-primary transition-colors text-sm font-medium"
                >
                  Limpiar filtros
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setToast({ show: true, message: 'Historial actualizado.', type: 'success' })}
                  className="flex items-center gap-2 h-10 px-6 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualizar
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    {['Tipo', 'Usuario', 'Fragmento', 'Justificación (vista previa)', 'Fecha', 'Estado', 'Resuelto por', 'Acciones'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((row) => (
                    <tr key={row.id} className="border-b border-border hover:bg-secondary/30 transition-colors">

                      {/* Tipo */}
                      <td className="px-4 py-3.5">
                        <div className={`flex items-center gap-1.5 text-sm font-medium ${
                          row.kind === 'Publicación' ? 'text-primary'
                          : row.kind === 'Mensaje'   ? 'text-blue-600'
                          : 'text-amber-600'
                        }`}>
                          {KIND_ICON[row.kind]}
                          {row.kind}
                        </div>
                      </td>

                      {/* Usuario */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="text-sm">{row.studentName}</span>
                        </div>
                      </td>

                      {/* Fragmento */}
                      <td className="px-4 py-3.5 max-w-[160px]">
                        <p className="text-sm text-muted-foreground truncate">{row.excerpt}</p>
                      </td>

                      {/* Justificación */}
                      <td className="px-4 py-3.5 max-w-[200px]">
                        <p className="text-sm text-muted-foreground truncate italic">{row.justification}</p>
                      </td>

                      {/* Fecha */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{row.date}</span>
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3.5">
                        <StatusChip status={row.status} />
                      </td>

                      {/* Resuelto por */}
                      <td className="px-4 py-3.5">
                        {row.resolvedBy ? (
                          <div>
                            <p className="text-xs font-medium text-foreground">{row.resolvedBy}</p>
                            <p className="text-xs text-muted-foreground">{row.resolvedDate}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {/* Ver detalle siempre */}
                          <button
                            type="button"
                            title="Ver detalle"
                            onClick={() => navigate('/admin/apelaciones')}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          {/* Revisar — solo si pendiente */}
                          {row.status === 'Pendiente' && (
                            <button
                              type="button"
                              title="Revisar apelación"
                              onClick={() => navigate('/admin/apelaciones')}
                              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-primary text-primary hover:bg-primary/5 transition-colors text-xs font-medium"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                              Revisar
                            </button>
                          )}

                          {/* Ver resolución — si ya fue resuelta */}
                          {row.status !== 'Pendiente' && (
                            <button
                              type="button"
                              title="Ver resolución"
                              onClick={() => navigate('/admin/apelaciones')}
                              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-muted-foreground hover:border-foreground/30 transition-colors text-xs font-medium"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              Resolución
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="px-5 py-3.5 border-t border-border bg-secondary/30 flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs text-muted-foreground">
              {pending} pendiente{pending !== 1 ? 's' : ''} ·{' '}
              {approved} aprobada{approved !== 1 ? 's' : ''} ·{' '}
              {rejected} rechazada{rejected !== 1 ? 's' : ''} · Total: {ALL_APPEALS.length}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/reportes')}
                className="flex items-center gap-1.5 text-xs text-primary hover:opacity-70 transition-opacity"
              >
                <Flag className="w-3.5 h-3.5" />
                Historial de reportes
              </button>
              <span className="text-border">|</span>
              <button
                type="button"
                onClick={() => navigate('/admin/moderacion')}
                className="flex items-center gap-1.5 text-xs text-primary hover:opacity-70 transition-opacity"
              >
                <Bot className="w-3.5 h-3.5" />
                Moderación automática
              </button>
            </div>
          </div>
        </div>

        {/* Leyenda */}
        <div className="mt-4 flex items-center gap-5 flex-wrap">
          {[
            { icon: <ExternalLink className="w-3.5 h-3.5" />, label: 'Ver detalle',      cls: 'text-muted-foreground' },
            { icon: <ShieldAlert  className="w-3.5 h-3.5" />, label: 'Revisar (pendiente)', cls: 'text-primary'      },
            { icon: <MessageCircle className="w-3.5 h-3.5" />, label: 'Ver resolución', cls: 'text-muted-foreground' },
          ].map((l) => (
            <div key={l.label} className={`flex items-center gap-1.5 text-xs ${l.cls}`}>
              {l.icon}
              <span className="text-muted-foreground">{l.label}</span>
            </div>
          ))}
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
