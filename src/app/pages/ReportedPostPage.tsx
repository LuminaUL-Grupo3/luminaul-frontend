import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  User, GraduationCap, ArrowLeft,
  Flag, Clock, BookOpen, Users,
  CheckCircle2, Trash2, ShieldCheck, AlertTriangle,
  Bell, ExternalLink,
} from 'lucide-react';
import { Toast } from '../components/Toast';
import { DeletePostModal } from '../components/DeletePostModal';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

type PostStatus  = 'En revisión' | 'Reporte válido' | 'Eliminada' | 'Visible';
type ReportState = 'Confirmado'  | 'En revisión'    | 'Descartado';

interface ReportRow {
  id: number;
  date: string;
  reporter: string;
  reason: string;
  state: ReportState;
}

const AUTHOR = {
  name: 'Carlos Mendoza',
  career: 'Ingeniería de Sistemas',
  accountStatus: 'Activa',
};

const POST = {
  text: 'Este grupo es una completa pérdida de tiempo. Los "asesores" no saben nada y solo cobran dinero. Mejor busquen en otro lado porque aquí solo pierden el tiempo con gente que finge saber.',
  course: 'Estructuras de Datos I',
  studyGroup: 'Grupo A – Mañana',
  date: '29 jun 2025 · 10:14',
  reportCount: 4,
  mainReason: 'Lenguaje ofensivo',
};

const REPORT_HISTORY: ReportRow[] = [
  { id: 1, date: '29 jun 2025', reporter: 'Usuario #1247', reason: 'Lenguaje ofensivo',    state: 'Confirmado'  },
  { id: 2, date: '29 jun 2025', reporter: 'Usuario #0883', reason: 'Acoso o bullying',     state: 'Confirmado'  },
  { id: 3, date: '28 jun 2025', reporter: 'Usuario #3301', reason: 'Contenido inapropiado', state: 'Confirmado' },
  { id: 4, date: '28 jun 2025', reporter: 'Usuario #0561', reason: 'Lenguaje ofensivo',    state: 'En revisión' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const POST_STATUS_CFG: Record<PostStatus, { cls: string; dot: string; label: string }> = {
  'En revisión':    { cls: 'bg-amber-50  text-amber-700  border-amber-200',  dot: 'bg-amber-500',  label: 'En revisión'             },
  'Reporte válido': { cls: 'bg-red-50    text-red-700    border-red-200',    dot: 'bg-red-500',    label: 'Reporte válido'           },
  'Eliminada':      { cls: 'bg-red-50    text-red-700    border-red-200',    dot: 'bg-red-500',    label: 'Eliminada'                },
  'Visible':        { cls: 'bg-green-50  text-green-700  border-green-200',  dot: 'bg-green-500',  label: 'Visible – Sin eliminación' },
};

const REPORT_ROW_CFG: Record<ReportState, { cls: string; label: string }> = {
  'Confirmado':  { cls: 'bg-red-50    text-red-700    border-red-200',   label: 'Confirmado'  },
  'En revisión': { cls: 'bg-amber-50  text-amber-700  border-amber-200', label: 'En revisión' },
  'Descartado':  { cls: 'bg-secondary text-muted-foreground border-border', label: 'Descartado' },
};

function StatusChip({ status }: { status: PostStatus }) {
  const c = POST_STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function ReportedPostPage() {
  const navigate = useNavigate();

  const [postStatus,     setPostStatus]     = useState<PostStatus>('Reporte válido');
  const [showModal,      setShowModal]      = useState(false);
  const [deletedAt,      setDeletedAt]      = useState('');
  const [deleteReason,   setDeleteReason]   = useState('');
  const [showNotif,      setShowNotif]      = useState(false);
  const [toast,          setToast]          = useState<ToastState>({ show: false, message: '', type: 'success' });

  const isDeleted  = postStatus === 'Eliminada';
  const isResolved = postStatus === 'Visible';
  const isFinished = isDeleted || isResolved;

  const handleDelete = (reason: string) => {
    setDeleteReason(reason);
    setDeletedAt(new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }));
    setPostStatus('Eliminada');
    setShowModal(false);
    setShowNotif(true);
    setToast({ show: true, message: 'Publicación eliminada con éxito.', type: 'success' });
  };

  const handleKeep = () => {
    setPostStatus('Visible');
    setToast({ show: true, message: 'La publicación permanecerá visible.', type: 'success' });
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Volver */}
        <button
          onClick={() => navigate('/admin/moderacion')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver a moderación
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl mb-2">Detalle de publicación reportada</h1>
          <p className="text-muted-foreground">Revisa la publicación y decide si debe mantenerse o eliminarse</p>
        </div>

        {/* Tarjeta del autor */}
        <div className="bg-white rounded-xl border border-border overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-border">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h2 className="text-xl font-semibold">{AUTHOR.name}</h2>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {AUTHOR.accountStatus}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-sm">{AUTHOR.career}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Banner eliminada */}
        {isDeleted && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <Trash2 className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-destructive">Esta publicación fue retirada por incumplir las normas de la comunidad.</p>
              <p className="text-xs text-red-700 mt-0.5">Eliminada el {deletedAt} · Motivo: {deleteReason}</p>
            </div>
          </div>
        )}

        {/* Banner resuelta sin eliminar */}
        {isResolved && (
          <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-green-800">La publicación permanecerá visible. Reporte resuelto sin eliminación.</p>
          </div>
        )}

        {/* Tarjeta de publicación */}
        <div className={`bg-white rounded-xl border overflow-hidden mb-6 ${isDeleted ? 'border-red-200 opacity-75' : 'border-border'}`}>
          <div className="p-5 border-b border-border flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-semibold text-sm">{AUTHOR.name.charAt(0)}</span>
              </div>
              <div>
                <p className="text-sm font-semibold">{AUTHOR.name}</p>
                <p className="text-xs text-muted-foreground">{POST.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200">
                <Flag className="w-3 h-3" />
                {POST.reportCount} reportes
              </span>
              <StatusChip status={postStatus} />
            </div>
          </div>

          <div className="p-5">
            <p className={`text-sm leading-relaxed mb-4 ${isDeleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {POST.text}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>{POST.course}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>{POST.studyGroup}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{POST.date}</span>
              </div>
            </div>
          </div>

          {/* Motivo principal */}
          <div className="px-5 pb-5">
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-destructive mb-0.5">Motivo principal del reporte</p>
                <p className="text-sm text-red-700">{POST.mainReason}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Historial de reportes */}
        <div className="bg-white rounded-xl border border-border overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h3 className="text-lg font-semibold">Historial de reportes</h3>
            <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
              {REPORT_HISTORY.length} reportes
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  {['Fecha', 'Usuario (anonimizado)', 'Motivo', 'Estado'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {REPORT_HISTORY.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-muted-foreground whitespace-nowrap">{r.date}</td>
                    <td className="px-5 py-3.5 text-sm text-foreground">{r.reporter}</td>
                    <td className="px-5 py-3.5 text-sm">{r.reason}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${REPORT_ROW_CFG[r.state].cls}`}>
                        {REPORT_ROW_CFG[r.state].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notificación al autor (post-eliminación) */}
        {showNotif && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-sm font-semibold text-amber-800">Notificación enviada al autor</p>
            </div>
            <div className="bg-white rounded-lg border border-amber-200 p-4 space-y-2">
              <p className="text-sm font-semibold text-foreground">Tu publicación fue eliminada</p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Motivo:</span> {deleteReason}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Fecha:</span> {deletedAt}
              </p>
              <button
                type="button"
                className="flex items-center gap-1.5 text-sm text-primary hover:underline mt-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Consultar normas de la comunidad
              </button>
            </div>
          </div>
        )}

        {/* Zona de acción */}
        <div className={`bg-white rounded-xl overflow-hidden mb-8 ${isFinished ? 'border border-border' : 'border-2 border-red-200'}`}>
          <div className={`px-6 py-4 border-b flex items-center gap-3 ${isFinished ? 'border-border bg-secondary/30' : 'border-red-200 bg-red-50'}`}>
            <Trash2 className={`w-5 h-5 ${isFinished ? 'text-muted-foreground' : 'text-destructive'}`} />
            <h3 className={`text-lg font-semibold ${isFinished ? 'text-muted-foreground' : 'text-destructive'}`}>
              Acción de moderación
            </h3>
          </div>
          <div className="p-6 flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1">
              <p className="font-semibold mb-1">
                {isDeleted  ? 'Publicación eliminada'
                 : isResolved ? 'Reporte resuelto sin eliminación'
                 : 'Decidir sobre esta publicación'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isDeleted
                  ? `Eliminada el ${deletedAt}. No se pueden realizar más acciones.`
                  : isResolved
                  ? 'La publicación permanece visible. No se pueden realizar más acciones.'
                  : 'Puedes mantener la publicación o eliminarla del feed público definitivamente.'}
              </p>
            </div>
            {!isFinished && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleKeep}
                  className="flex items-center gap-2 h-11 px-5 border border-border rounded-lg hover:border-green-400 hover:text-green-700 transition-colors text-sm font-medium"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mantener publicación
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 h-11 px-5 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors text-sm font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar publicación
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <DeletePostModal
        isOpen={showModal}
        author={AUTHOR.name}
        date={POST.date}
        mainReason={POST.mainReason}
        reportCount={POST.reportCount}
        onConfirm={handleDelete}
        onCancel={() => setShowModal(false)}
      />

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
