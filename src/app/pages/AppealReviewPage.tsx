import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  User, GraduationCap, ArrowLeft,
  FileText, MessageSquare, Star,
  Clock, CheckCircle2, XCircle, Bot,
  AlertTriangle, Bell, ShieldCheck, History,
  ChevronRight,
} from 'lucide-react';
import { Toast } from '../components/Toast';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

type AppealStatus = 'Pendiente' | 'Aprobada' | 'Rechazada';
type ContentKind  = 'Publicación' | 'Mensaje' | 'Reseña';

interface Appeal {
  id: number;
  studentName: string;
  studentCareer: string;
  kind: ContentKind;
  appealDate: string;
  botReason: string;
  originalContent: string;
  justification: string;
  status: AppealStatus;
  resolvedBy?: string;
  resolvedDate?: string;
}

const INITIAL_APPEALS: Appeal[] = [
  {
    id: 1,
    studentName:  'usuario_anonimo_32',
    studentCareer: 'Ingeniería de Sistemas',
    kind: 'Publicación',
    appealDate: '30 jun 2025',
    botReason: 'Lenguaje ofensivo detectado por el bot.',
    originalContent:
      'Este grupo es una completa pérdida de tiempo. Los "asesores" no saben nada y solo cobran dinero. Mejor busquen en otro lado.',
    justification:
      'Mi publicación expresa una opinión crítica pero no contiene insultos directos. Simplemente describí mi experiencia negativa con el grupo. Considero que el bot interpretó incorrectamente el tono del mensaje.',
    status: 'Pendiente',
  },
  {
    id: 2,
    studentName:  'usuaria_345',
    studentCareer: 'Administración de Negocios',
    kind: 'Reseña',
    appealDate: '29 jun 2025',
    botReason: 'Contenido potencialmente engañoso.',
    originalContent:
      'Mal asesor, no sé cómo tiene tantas reseñas positivas... probablemente falsas. No lo recomiendo para nada.',
    justification:
      'Mi reseña refleja mi experiencia real. Tengo derecho a opinar sobre el servicio recibido. No afirmo nada como hecho, solo comparto mi sospecha personal basada en lo que viví.',
    status: 'Pendiente',
  },
  {
    id: 3,
    studentName:  'usuario_nuevo_99',
    studentCareer: 'Marketing',
    kind: 'Mensaje',
    appealDate: '28 jun 2025',
    botReason: 'Posible spam comercial detectado.',
    originalContent:
      'Vendo apuntes de todos los cursos a precio especial $$$ contactar por interno para más info.',
    justification:
      'No tengo ánimo de lucro, solo quería compartir mis apuntes con compañeros que los necesiten. El precio que mencioné es simbólico para cubrir el costo de impresión.',
    status: 'Pendiente',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const KIND_ICON: Record<ContentKind, React.ReactNode> = {
  'Publicación': <FileText      className="w-4 h-4 text-muted-foreground" />,
  'Mensaje':     <MessageSquare className="w-4 h-4 text-muted-foreground" />,
  'Reseña':      <Star          className="w-4 h-4 text-muted-foreground" />,
};

type StatusCfg = { cls: string; dot: string; icon: React.ReactNode; label: string };
const STATUS_CFG: Record<AppealStatus, StatusCfg> = {
  'Pendiente': { cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', icon: <Clock         className="w-3.5 h-3.5" />, label: 'Pendiente de revisión' },
  'Aprobada':  { cls: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500', icon: <CheckCircle2  className="w-3.5 h-3.5" />, label: 'Aprobada'              },
  'Rechazada': { cls: 'bg-red-50   text-red-700   border-red-200',   dot: 'bg-red-500',   icon: <XCircle       className="w-3.5 h-3.5" />, label: 'Rechazada'             },
};

function StatusChip({ status }: { status: AppealStatus }) {
  const c = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${c.cls}`}>
      {c.icon}
      {c.label}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type View = 'list' | 'detail';

export function AppealReviewPage() {
  const navigate  = useNavigate();

  const [appeals,    setAppeals]    = useState<Appeal[]>(INITIAL_APPEALS);
  const [view,       setView]       = useState<View>('list');
  const [selected,   setSelected]   = useState<Appeal | null>(null);
  const [notes,      setNotes]      = useState('');
  const [toast,      setToast]      = useState<ToastState>({ show: false, message: '', type: 'success' });
  const [showTab,    setShowTab]    = useState<'pending' | 'history'>('pending');

  const pending  = appeals.filter((a) => a.status === 'Pendiente');
  const resolved = appeals.filter((a) => a.status !== 'Pendiente');

  const openDetail = (appeal: Appeal) => {
    setSelected(appeal);
    setNotes('');
    setView('detail');
  };

  const resolve = (status: 'Aprobada' | 'Rechazada') => {
    if (!selected) return;
    const now   = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' });
    const updated: Appeal = { ...selected, status, resolvedBy: 'Admin LuminaUL', resolvedDate: now };
    setAppeals((prev) => prev.map((a) => a.id === selected.id ? updated : a));
    setSelected(updated);
    const msg = status === 'Aprobada'
      ? 'Apelación aprobada con éxito.'
      : 'Apelación rechazada con éxito.';
    setToast({ show: true, message: msg, type: 'success' });
  };

  const isResolved = selected?.status !== 'Pendiente';

  // ── DETAIL VIEW ──────────────────────────────────────────────────────────────
  if (view === 'detail' && selected) {
    return (
      <>
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => { setView('list'); setShowTab('pending'); }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al panel de apelaciones
          </button>

          <div className="mb-6">
            <h1 className="text-3xl mb-2">Detalle de apelación</h1>
            <p className="text-muted-foreground">Revisa el contenido y la justificación del estudiante</p>
          </div>

          {/* Resultado banner si ya fue resuelto */}
          {isResolved && (
            <div className={`flex items-start gap-3 rounded-xl p-4 mb-6 border ${
              selected.status === 'Aprobada'
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              {selected.status === 'Aprobada'
                ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                : <XCircle      className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              }
              <div className="space-y-1">
                {selected.status === 'Aprobada' ? (
                  <>
                    <p className="text-sm font-semibold text-green-800">Apelación aprobada — contenido restaurado</p>
                    <p className="text-xs text-green-700">El bloqueo automático fue revertido · El estudiante fue notificado · Caso resuelto por {selected.resolvedBy}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-destructive">Apelación rechazada — contenido continúa oculto</p>
                    <p className="text-xs text-red-700">La apelación queda archivada · El estudiante fue notificado · Caso resuelto por {selected.resolvedBy}</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Info del estudiante */}
          <div className="bg-white rounded-xl border border-border overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-border">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h2 className="text-xl font-semibold">{selected.studentName}</h2>
                    <StatusChip status={selected.status} />
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <GraduationCap className="w-4 h-4" />
                    <span className="text-sm">{selected.studentCareer}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Apelación enviada el {selected.appealDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido original */}
          <div className="bg-white rounded-xl border border-border p-6 mb-6 space-y-4">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                {KIND_ICON[selected.kind]}
              </div>
              <div>
                <h3 className="text-lg font-semibold">Contenido original bloqueado</h3>
                <p className="text-xs text-muted-foreground">{selected.kind}</p>
              </div>
            </div>

            <div className="bg-secondary rounded-lg border border-border p-4">
              <p className="text-sm text-foreground leading-relaxed">"{selected.originalContent}"</p>
            </div>

            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg p-3">
              <Bot className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-destructive mb-0.5">Motivo del bloqueo automático</p>
                <p className="text-sm text-red-700">{selected.botReason}</p>
              </div>
            </div>
          </div>

          {/* Justificación del alumno */}
          <div className="bg-white rounded-xl border border-border p-6 mb-6 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-semibold">Justificación del estudiante</h3>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-foreground leading-relaxed">{selected.justification}</p>
            </div>
          </div>

          {/* Panel de decisión */}
          <div className={`bg-white rounded-xl overflow-hidden mb-8 ${isResolved ? 'border border-border' : 'border-2 border-primary/30'}`}>
            <div className={`px-6 py-4 border-b flex items-center gap-3 ${isResolved ? 'border-border bg-secondary/30' : 'border-primary/20 bg-primary/5'}`}>
              <ShieldCheck className={`w-5 h-5 ${isResolved ? 'text-muted-foreground' : 'text-primary'}`} />
              <h3 className={`text-lg font-semibold ${isResolved ? 'text-muted-foreground' : 'text-foreground'}`}>
                Panel de decisión
              </h3>
            </div>
            <div className="p-6 space-y-5">
              {!isResolved && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Observaciones internas <span className="text-muted-foreground text-xs font-normal">(opcional)</span>
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notas internas para el registro de moderación..."
                    rows={3}
                    maxLength={400}
                    className="w-full px-4 py-3 bg-white border border-input rounded-lg focus:border-primary focus:outline-none transition-colors resize-none text-sm"
                  />
                  <p className="text-xs text-muted-foreground text-right">{notes.length}/400</p>
                </div>
              )}

              <div className={`flex items-center gap-3 flex-wrap ${isResolved ? 'opacity-50' : ''}`}>
                <button
                  type="button"
                  disabled={isResolved}
                  onClick={() => resolve('Aprobada')}
                  className={`flex items-center gap-2 h-11 px-6 rounded-lg text-sm font-medium transition-colors ${
                    isResolved
                      ? 'bg-secondary text-muted-foreground cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Aprobar apelación
                </button>
                <button
                  type="button"
                  disabled={isResolved}
                  onClick={() => resolve('Rechazada')}
                  className={`flex items-center gap-2 h-11 px-6 rounded-lg text-sm font-medium transition-colors ${
                    isResolved
                      ? 'bg-secondary text-muted-foreground cursor-not-allowed'
                      : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  Rechazar apelación
                </button>
              </div>

              {isResolved && (
                <p className="text-xs text-muted-foreground">
                  Resuelto el {selected.resolvedDate} por {selected.resolvedBy}. No se pueden realizar más acciones.
                </p>
              )}
            </div>
          </div>

          {/* Notificación simulada al estudiante */}
          {isResolved && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-sm font-semibold text-amber-800">Notificación enviada al estudiante</p>
              </div>
              <div className="bg-white rounded-lg border border-amber-200 p-4 space-y-1.5">
                <p className="text-sm font-semibold text-foreground">
                  Tu apelación fue {selected.status === 'Aprobada' ? 'aprobada' : 'rechazada'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selected.status === 'Aprobada'
                    ? 'Tu contenido ha sido restaurado y vuelve a estar visible en la plataforma.'
                    : 'Tu contenido continúa oculto. Si tienes dudas, consulta las normas de la comunidad.'}
                </p>
                <p className="text-xs text-muted-foreground">Fecha: {selected.resolvedDate}</p>
              </div>
            </div>
          )}
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

  // ── LIST VIEW ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/admin/moderacion')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a moderación
        </button>

        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-3xl">Panel de apelaciones</h1>
            </div>
            <p className="text-muted-foreground ml-[52px]">
              Revisa y resuelve las solicitudes de apelación enviadas por los estudiantes
            </p>
          </div>
        </div>

        {/* Tarjetas resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {[
            { icon: <Clock        className="w-6 h-6 text-amber-600" />, bg: 'bg-amber-100', label: 'Pendientes de revisión', value: pending.length  },
            { icon: <CheckCircle2 className="w-6 h-6 text-green-600" />, bg: 'bg-green-100', label: 'Aprobadas',              value: resolved.filter((a) => a.status === 'Aprobada').length  },
            { icon: <XCircle      className="w-6 h-6 text-destructive"/>, bg: 'bg-red-100',  label: 'Rechazadas',             value: resolved.filter((a) => a.status === 'Rechazada').length },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-xl border border-border p-6">
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-12 h-12 ${c.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                  {c.icon}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{c.label}</p>
                  <p className="text-3xl font-bold">{c.value}</p>
                </div>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    c.label.includes('Pend') ? 'bg-amber-500' : c.label.includes('Aprob') ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: appeals.length ? `${(c.value / appeals.length) * 100}%` : '0%' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Pestañas */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="flex border-b border-border">
            {[
              { key: 'pending' as const, label: 'Pendientes', count: pending.length  },
              { key: 'history' as const, label: 'Historial',  count: resolved.length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setShowTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  showTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.key === 'pending' ? <Clock className="w-4 h-4" /> : <History className="w-4 h-4" />}
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  showTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Pendientes */}
          {showTab === 'pending' && (
            <div className="divide-y divide-border">
              {pending.length === 0 ? (
                <div className="flex flex-col items-center py-14 text-center">
                  <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">No hay apelaciones pendientes.</p>
                </div>
              ) : (
                pending.map((appeal) => (
                  <div
                    key={appeal.id}
                    className="flex items-center gap-4 px-6 py-5 hover:bg-secondary/30 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-sm font-semibold">{appeal.studentName}</p>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          {KIND_ICON[appeal.kind]}
                          {appeal.kind}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{appeal.appealDate}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        <span className="font-medium">Bot:</span> {appeal.botReason}
                      </p>
                    </div>

                    {/* Estado + acción */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <StatusChip status={appeal.status} />
                      <button
                        type="button"
                        onClick={() => openDetail(appeal)}
                        className="flex items-center gap-1.5 h-9 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                      >
                        Revisar apelación
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Historial */}
          {showTab === 'history' && (
            <div className="overflow-x-auto">
              {resolved.length === 0 ? (
                <div className="flex flex-col items-center py-14 text-center">
                  <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mb-3">
                    <History className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">Aún no hay apelaciones resueltas.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      {['Estudiante', 'Fecha', 'Tipo', 'Resultado', 'Resuelto por'].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resolved.map((appeal) => (
                      <tr
                        key={appeal.id}
                        className="border-b border-border hover:bg-secondary/30 transition-colors cursor-pointer"
                        onClick={() => openDetail(appeal)}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium">{appeal.studentName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-muted-foreground whitespace-nowrap">{appeal.resolvedDate ?? appeal.appealDate}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            {KIND_ICON[appeal.kind]}
                            {appeal.kind}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusChip status={appeal.status} />
                        </td>
                        <td className="px-5 py-3.5 text-sm text-muted-foreground">{appeal.resolvedBy ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border bg-secondary/30">
            <p className="text-xs text-muted-foreground">
              {pending.length} pendiente{pending.length !== 1 ? 's' : ''} · {resolved.length} resuelta{resolved.length !== 1 ? 's' : ''} · Total: {appeals.length}
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
