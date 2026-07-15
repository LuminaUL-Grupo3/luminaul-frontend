import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Flag, FileText, MessageSquare, Star,
  User, UserX, ShieldCheck, Bot,
  Search, RefreshCw, ChevronDown,
  Trash2, ExternalLink, MessageCircle,
  Filter, ArrowUpDown, ShieldAlert,
} from 'lucide-react';
import { Toast } from '../components/Toast';

interface ToastState { show: boolean; message: string; type: 'success' | 'error'; }

type ContentKind  = 'Publicación' | 'Mensaje' | 'Reseña';
type ReportStatus = 'Pendiente' | 'En revisión' | 'Resuelto' | 'Eliminado';
type SortMode     = 'recientes' | 'reportados';

interface ReportRow {
  id: number;
  kind: ContentKind;
  excerpt: string;
  author: string;
  reportCount: number;
  mainReason: string;
  date: string;
  status: ReportStatus;
  hasAppeal: boolean;
}

const ALL_REPORTS: ReportRow[] = [
  { id: 1,  kind: 'Publicación', excerpt: '"Este grupo es una pérdida de tiempo, todos son unos..."',     author: 'usuario_anonimo_32', reportCount: 4, mainReason: 'Lenguaje ofensivo',            date: '29 jun 2025', status: 'Eliminado',   hasAppeal: true  },
  { id: 2,  kind: 'Mensaje',     excerpt: '"Vendo apuntes de todos los cursos a precio especial $$$..."', author: 'usuario_nuevo_99',  reportCount: 3, mainReason: 'Spam',                        date: '27 jun 2025', status: 'En revisión', hasAppeal: true  },
  { id: 3,  kind: 'Reseña',      excerpt: '"Mal asesor, probablemente las reseñas positivas son falsas"', author: 'usuaria_345',       reportCount: 2, mainReason: 'Información falsa',           date: '24 may 2025', status: 'Resuelto',    hasAppeal: false },
  { id: 4,  kind: 'Publicación', excerpt: '"Nadie en este grupo sabe estudiar, son todos unos..."',        author: 'carlos_m_2024',     reportCount: 5, mainReason: 'Acoso o bullying',            date: '22 jun 2025', status: 'Pendiente',   hasAppeal: false },
  { id: 5,  kind: 'Mensaje',     excerpt: '"Hagan la tarea por mí o les digo al profe que copiaron"',     author: 'anon_user_881',     reportCount: 3, mainReason: 'Acoso o bullying',            date: '20 jun 2025', status: 'En revisión', hasAppeal: false },
  { id: 6,  kind: 'Reseña',      excerpt: '"Este asesor cobra y no enseña nada, es un fraude total"',     author: 'estudiante_499',    reportCount: 2, mainReason: 'Lenguaje ofensivo',           date: '18 jun 2025', status: 'Pendiente',   hasAppeal: false },
  { id: 7,  kind: 'Publicación', excerpt: '"Contactar para copiar trabajos finales, precio especial..."', author: 'pepe_lp_99',        reportCount: 6, mainReason: 'Contenido inapropiado',       date: '15 jun 2025', status: 'Eliminado',   hasAppeal: false },
  { id: 8,  kind: 'Mensaje',     excerpt: '"No me importa lo que digan, igual voy a seguir así"',         author: 'carlos_m_2024',     reportCount: 1, mainReason: 'Lenguaje ofensivo',           date: '12 jun 2025', status: 'Resuelto',    hasAppeal: false },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const KIND_ICON: Record<ContentKind, React.ReactNode> = {
  'Publicación': <FileText      className="w-4 h-4" />,
  'Mensaje':     <MessageSquare className="w-4 h-4" />,
  'Reseña':      <Star          className="w-4 h-4" />,
};

type StatusCfg = { cls: string; dot: string; label: string };
const STATUS_CFG: Record<ReportStatus, StatusCfg> = {
  'Pendiente':   { cls: 'bg-amber-50  text-amber-700  border-amber-200',  dot: 'bg-amber-500',  label: 'Pendiente'   },
  'En revisión': { cls: 'bg-blue-50   text-blue-700   border-blue-200',   dot: 'bg-blue-500',   label: 'En revisión' },
  'Resuelto':    { cls: 'bg-green-50  text-green-700  border-green-200',  dot: 'bg-green-500',  label: 'Resuelto'    },
  'Eliminado':   { cls: 'bg-red-50    text-red-700    border-red-200',    dot: 'bg-red-500',    label: 'Eliminado'   },
};

function StatusChip({ status }: { status: ReportStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type KindFilter   = 'Todos' | ContentKind;
type StatusFilter = 'Todos' | ReportStatus;

export function ReportHistoryPage() {
  const navigate = useNavigate();

  const [search,      setSearch]      = useState('');
  const [kindFilter,  setKindFilter]  = useState<KindFilter>('Todos');
  const [statusFilter,setStatusFilter]= useState<StatusFilter>('Todos');
  const [dateFrom,    setDateFrom]    = useState('');
  const [dateTo,      setDateTo]      = useState('');
  const [sortMode,    setSortMode]    = useState<SortMode>('recientes');
  const [showFilters, setShowFilters] = useState(false);
  const [toast,       setToast]       = useState<ToastState>({ show: false, message: '', type: 'success' });

  // ── Stats ──
  const pending     = ALL_REPORTS.filter((r) => r.status === 'Pendiente').length;
  const publications= ALL_REPORTS.filter((r) => r.kind === 'Publicación').length;
  const suspended   = 1; // simulado
  const botModerated= ALL_REPORTS.filter((r) => r.status === 'Eliminado').length;

  // ── Filtrado + orden ──
  const displayed = useMemo(() => {
    let rows = [...ALL_REPORTS];

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((r) =>
        r.author.toLowerCase().includes(q) ||
        r.excerpt.toLowerCase().includes(q) ||
        r.mainReason.toLowerCase().includes(q)
      );
    }
    if (kindFilter   !== 'Todos') rows = rows.filter((r) => r.kind   === kindFilter);
    if (statusFilter !== 'Todos') rows = rows.filter((r) => r.status === statusFilter);

    if (sortMode === 'reportados') {
      rows.sort((a, b) => b.reportCount - a.reportCount);
    }
    return rows;
  }, [search, kindFilter, statusFilter, sortMode]);

  const hasFilters = search || kindFilter !== 'Todos' || statusFilter !== 'Todos';

  const clearFilters = () => {
    setSearch(''); setKindFilter('Todos'); setStatusFilter('Todos');
    setDateFrom(''); setDateTo('');
  };

  // ── SUMMARY CARDS ──
  const summaryCards = [
    {
      icon: <Flag      className="w-6 h-6 text-amber-600" />,
      bg:   'bg-amber-100',
      bar:  'bg-amber-500',
      label: 'Reportes pendientes',
      value: pending,
      total: ALL_REPORTS.length,
    },
    {
      icon: <FileText  className="w-6 h-6 text-primary" />,
      bg:   'bg-primary/10',
      bar:  'bg-primary',
      label: 'Publicaciones reportadas',
      value: publications,
      total: ALL_REPORTS.length,
    },
    {
      icon: <UserX     className="w-6 h-6 text-destructive" />,
      bg:   'bg-red-100',
      bar:  'bg-red-500',
      label: 'Usuarios suspendidos',
      value: suspended,
      total: 10,
    },
    {
      icon: <Bot       className="w-6 h-6 text-blue-600" />,
      bg:   'bg-blue-100',
      bar:  'bg-blue-500',
      label: 'Moderado automáticamente',
      value: botModerated,
      total: ALL_REPORTS.length,
    },
  ];

  return (
    <>
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Flag className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-3xl">Historial de reportes</h1>
            </div>
            <p className="text-muted-foreground ml-[52px]">
              Centro de operaciones de moderación — gestiona todos los reportes de la plataforma
            </p>
          </div>

          {/* Accesos rápidos a otras pantallas admin */}
          <div className="flex items-center gap-2 flex-wrap">
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
              onClick={() => navigate('/admin/apelaciones')}
              className="flex items-center gap-1.5 h-9 px-3 border border-border rounded-lg hover:border-primary hover:text-primary transition-colors text-sm"
            >
              <ShieldCheck className="w-4 h-4" />
              Apelaciones
            </button>
            <button
              type="button"
              onClick={() => setToast({ show: true, message: 'Historial actualizado.', type: 'success' })}
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
          {/* Fila 1: búsqueda + botón filtros */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por usuario, contenido o motivo..."
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
                <option value="reportados">Más reportados</option>
              </select>
              <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Fila 2: filtros expandibles */}
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
                {(['Todos', 'Pendiente', 'En revisión', 'Resuelto', 'Eliminado'] as StatusFilter[]).map((s) => (
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
          {/* Contador */}
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando <span className="font-semibold text-foreground">{displayed.length}</span> de{' '}
              <span className="font-semibold text-foreground">{ALL_REPORTS.length}</span> reportes
            </p>
            {hasFilters && (
              <button type="button" onClick={clearFilters} className="text-xs text-primary hover:opacity-70">
                Limpiar filtros
              </button>
            )}
          </div>

          {displayed.length === 0 ? (
            /* Estado vacío */
            <div className="flex flex-col items-center py-16 text-center px-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Flag className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">
                {hasFilters ? 'Sin resultados' : 'No hay contenido reportado'}
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mb-6">
                {hasFilters
                  ? 'Ningún reporte coincide con los filtros seleccionados.'
                  : 'Cuando los usuarios reporten publicaciones, mensajes o reseñas aparecerán aquí.'}
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
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    {['Tipo', 'Fragmento', 'Usuario', 'Reportes', 'Motivo principal', 'Fecha', 'Estado', 'Acciones'].map((h) => (
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

                      {/* Fragmento */}
                      <td className="px-4 py-3.5 max-w-[200px]">
                        <p className="text-sm text-muted-foreground truncate">{row.excerpt}</p>
                      </td>

                      {/* Usuario */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <span className="text-sm">{row.author}</span>
                        </div>
                      </td>

                      {/* Reportes */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-sm font-semibold ${
                          row.reportCount >= 4 ? 'text-destructive' : row.reportCount >= 2 ? 'text-amber-600' : 'text-muted-foreground'
                        }`}>
                          <Flag className="w-3.5 h-3.5" />
                          {row.reportCount}
                        </span>
                      </td>

                      {/* Motivo */}
                      <td className="px-4 py-3.5">
                        <span className="text-sm text-foreground">{row.mainReason}</span>
                      </td>

                      {/* Fecha */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{row.date}</span>
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3.5">
                        <StatusChip status={row.status} />
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Ver detalle */}
                          <button
                            type="button"
                            title="Ver detalle"
                            onClick={() => navigate(`/admin/publicaciones/${row.id}/reporte`)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          {/* Revisar apelación */}
                          {row.hasAppeal && (
                            <button
                              type="button"
                              title="Revisar apelación"
                              onClick={() => navigate('/admin/apelaciones')}
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-amber-300 text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <ShieldAlert className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Eliminar publicación */}
                          {row.status !== 'Eliminado' && row.kind === 'Publicación' && (
                            <button
                              type="button"
                              title="Eliminar publicación"
                              onClick={() => navigate(`/admin/publicaciones/${row.id}/reporte`)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Suspender usuario */}
                          <button
                            type="button"
                            title="Suspender usuario"
                            onClick={() => navigate(`/admin/usuarios/${row.id}/suspension`)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="px-5 py-3.5 border-t border-border bg-secondary/30 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {ALL_REPORTS.filter((r) => r.status === 'Pendiente').length} pendiente{ALL_REPORTS.filter((r) => r.status === 'Pendiente').length !== 1 ? 's' : ''} ·{' '}
              {ALL_REPORTS.filter((r) => r.status === 'Eliminado').length} eliminado{ALL_REPORTS.filter((r) => r.status === 'Eliminado').length !== 1 ? 's' : ''} ·{' '}
              Última actualización: hoy
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/moderacion')}
                className="flex items-center gap-1.5 text-xs text-primary hover:opacity-70 transition-opacity"
              >
                <Bot className="w-3.5 h-3.5" />
                Ver moderación automática
              </button>
              <span className="text-border">|</span>
              <button
                type="button"
                onClick={() => navigate('/admin/apelaciones')}
                className="flex items-center gap-1.5 text-xs text-primary hover:opacity-70 transition-opacity"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Ver apelaciones
              </button>
            </div>
          </div>
        </div>

        {/* ── Leyenda de acciones ── */}
        <div className="mt-4 flex items-center gap-5 flex-wrap">
          {[
            { icon: <ExternalLink className="w-3.5 h-3.5" />, label: 'Ver detalle',          cls: 'text-muted-foreground' },
            { icon: <ShieldAlert  className="w-3.5 h-3.5" />, label: 'Revisar apelación',    cls: 'text-amber-600'        },
            { icon: <Trash2       className="w-3.5 h-3.5" />, label: 'Eliminar publicación', cls: 'text-red-600'          },
            { icon: <UserX        className="w-3.5 h-3.5" />, label: 'Suspender usuario',    cls: 'text-red-600'          },
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
