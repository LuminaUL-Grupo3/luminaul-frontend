import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  User, GraduationCap, ArrowLeft,
  FileText, MessageSquare, Star,
  ShieldCheck, ShieldAlert, ShieldX,
  Flag, Calendar, CheckCircle2,
} from 'lucide-react';
import { Toast } from '../components/Toast';
import { SuspendUserModal } from '../components/SuspendUserModal';
import type { SuspensionData } from '../components/SuspendUserModal';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

type AccountStatus = 'Activa' | 'Suspendida temporalmente' | 'Suspendida permanentemente';
type ContentKind   = 'Publicación' | 'Mensaje' | 'Reseña';
type ReportState   = 'Confirmado' | 'En revisión' | 'Descartado';

interface ReportEntry {
  id: number;
  date: string;
  kind: ContentKind;
  reason: string;
  state: ReportState;
}

const REPORTED_USER = {
  name: 'usuario_anonimo_32',
  career: 'Ingeniería de Sistemas',
  email: 'anonimo32@aloe.ulima.edu.pe',
  totalReports: 5,
  confirmed: 3,
  discarded: 1,
  lastReport: '29 jun 2025',
};

const REPORT_HISTORY: ReportEntry[] = [
  { id: 1, date: '29 jun 2025', kind: 'Publicación', reason: 'Lenguaje ofensivo',           state: 'Confirmado'  },
  { id: 2, date: '22 jun 2025', kind: 'Mensaje',     reason: 'Acoso o bullying',             state: 'Confirmado'  },
  { id: 3, date: '15 jun 2025', kind: 'Reseña',      reason: 'Información falsa',            state: 'En revisión' },
  { id: 4, date: '10 jun 2025', kind: 'Publicación', reason: 'Spam',                         state: 'Confirmado'  },
  { id: 5, date: '3 jun 2025',  kind: 'Mensaje',     reason: 'Contenido inapropiado',        state: 'Descartado'  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const KIND_ICON: Record<ContentKind, React.ReactNode> = {
  'Publicación': <FileText      className="w-4 h-4 text-muted-foreground" />,
  'Mensaje':     <MessageSquare className="w-4 h-4 text-muted-foreground" />,
  'Reseña':      <Star          className="w-4 h-4 text-muted-foreground" />,
};

const REPORT_STATE_CFG: Record<ReportState, { cls: string; label: string }> = {
  'Confirmado':  { cls: 'bg-red-50   text-red-700   border-red-200',   label: 'Confirmado'  },
  'En revisión': { cls: 'bg-amber-50 text-amber-700 border-amber-200', label: 'En revisión' },
  'Descartado':  { cls: 'bg-secondary text-muted-foreground border-border', label: 'Descartado' },
};

const ACCOUNT_STATUS_CFG: Record<AccountStatus, { cls: string; icon: React.ReactNode; dot: string }> = {
  'Activa':                    { cls: 'bg-green-50 text-green-700 border-green-200',  icon: <ShieldCheck className="w-3.5 h-3.5" />, dot: 'bg-green-500'  },
  'Suspendida temporalmente':  { cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: <ShieldAlert className="w-3.5 h-3.5" />, dot: 'bg-amber-500'  },
  'Suspendida permanentemente':{ cls: 'bg-red-50   text-red-700   border-red-200',   icon: <ShieldX     className="w-3.5 h-3.5" />, dot: 'bg-red-500'    },
};

function AccountChip({ status }: { status: AccountStatus }) {
  const c = ACCOUNT_STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${c.cls}`}>
      {c.icon}
      {status}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function UserSuspensionPage() {
  const navigate = useNavigate();

  const [accountStatus, setAccountStatus] = useState<AccountStatus>('Activa');
  const [showModal,     setShowModal]     = useState(false);
  const [suspension,    setSuspension]    = useState<SuspensionData | null>(null);
  const [suspendedAt,   setSuspendedAt]   = useState<string>('');
  const [toast,         setToast]         = useState<ToastState>({ show: false, message: '', type: 'success' });

  const isSuspended = accountStatus !== 'Activa';

  const handleConfirmSuspension = (data: SuspensionData) => {
    const newStatus: AccountStatus =
      data.type === 'permanent' ? 'Suspendida permanentemente' : 'Suspendida temporalmente';
    setAccountStatus(newStatus);
    setSuspension(data);
    setSuspendedAt(new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }));
    setShowModal(false);
    setToast({ show: true, message: 'La cuenta fue suspendida correctamente.', type: 'success' });
  };

  const durationLabel = () => {
    if (!suspension || suspension.type === 'permanent') return null;
    if (suspension.duration === 'custom') return `${suspension.customDays} días`;
    return { '3': '3 días', '7': '7 días', '30': '30 días' }[suspension.duration!] ?? '';
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
          <h1 className="text-3xl mb-2">Detalle del usuario reportado</h1>
          <p className="text-muted-foreground">Historial de infracciones y gestión de cuenta</p>
        </div>

        {/* Tarjeta de perfil */}
        <div className="bg-white rounded-xl border border-border overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-border">
            <div className="flex items-center gap-5">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 ${
                isSuspended ? 'bg-muted' : 'bg-primary'
              }`}>
                <User className={`w-8 h-8 ${isSuspended ? 'text-muted-foreground' : 'text-white'}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h2 className="text-xl font-semibold">{REPORTED_USER.name}</h2>
                  <AccountChip status={accountStatus} />
                </div>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-sm">{REPORTED_USER.career}</span>
                </div>
                <p className="text-sm text-muted-foreground">{REPORTED_USER.email}</p>
              </div>
            </div>
          </div>

          {/* Detalle suspensión activa */}
          {isSuspended && suspension && (
            <div className="px-6 py-4 bg-red-50 border-b border-red-200">
              <div className="flex items-start gap-3">
                <ShieldX className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-destructive">
                    Cuenta suspendida {suspension.type === 'permanent' ? 'permanentemente' : `por ${durationLabel()}`}
                  </p>
                  <p className="text-xs text-red-700">
                    <span className="font-medium">Motivo:</span> {suspension.reason}
                  </p>
                  <p className="text-xs text-red-700">
                    <span className="font-medium">Fecha:</span> {suspendedAt}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resumen de reportes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: <Flag className="w-5 h-5 text-primary" />,           label: 'Total reportes',    value: REPORTED_USER.totalReports, bg: 'bg-primary/10' },
            { icon: <ShieldX className="w-5 h-5 text-destructive" />,    label: 'Confirmados',        value: REPORTED_USER.confirmed,    bg: 'bg-red-100'    },
            { icon: <CheckCircle2 className="w-5 h-5 text-green-600" />, label: 'Descartados',        value: REPORTED_USER.discarded,    bg: 'bg-green-100'  },
            { icon: <Calendar className="w-5 h-5 text-amber-600" />,     label: 'Último reporte',     value: REPORTED_USER.lastReport,   bg: 'bg-amber-100'  },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center gap-3 mb-1">
                <div className={`w-9 h-9 ${card.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  {card.icon}
                </div>
                <p className="text-xs text-muted-foreground leading-tight">{card.label}</p>
              </div>
              <p className={`text-2xl font-bold ${typeof card.value === 'string' ? 'text-base font-semibold mt-1' : ''}`}>
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {/* Historial de reportes */}
        <div className="bg-white rounded-xl border border-border overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-lg font-semibold">Historial de reportes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  {['Fecha', 'Tipo de contenido', 'Motivo del reporte', 'Estado de revisión'].map((h) => (
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
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 text-sm">
                        {KIND_ICON[r.kind]}
                        <span>{r.kind}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm">{r.reason}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${REPORT_STATE_CFG[r.state].cls}`}>
                        {REPORT_STATE_CFG[r.state].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Acción de suspensión */}
        <div className={`bg-white rounded-xl overflow-hidden ${isSuspended ? 'border border-border' : 'border-2 border-red-200'}`}>
          <div className={`px-6 py-4 border-b ${isSuspended ? 'border-border bg-secondary/30' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center gap-3">
              <ShieldX className={`w-5 h-5 ${isSuspended ? 'text-muted-foreground' : 'text-destructive'}`} />
              <h3 className={`text-lg font-semibold ${isSuspended ? 'text-muted-foreground' : 'text-destructive'}`}>
                Zona de sanción
              </h3>
            </div>
          </div>
          <div className="p-6 flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1">
              <h4 className="font-semibold mb-1">Suspender cuenta</h4>
              <p className="text-sm text-muted-foreground">
                {isSuspended
                  ? 'Esta cuenta ya se encuentra suspendida. No se pueden aplicar nuevas sanciones.'
                  : 'Aplica una suspensión temporal o permanente cuando el historial de infracciones lo justifique.'}
              </p>
            </div>
            <button
              type="button"
              disabled={isSuspended}
              onClick={() => setShowModal(true)}
              className={`flex items-center gap-2 h-11 px-6 rounded-lg font-medium text-sm transition-colors flex-shrink-0 ${
                isSuspended
                  ? 'bg-secondary text-muted-foreground cursor-not-allowed'
                  : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
              }`}
            >
              <ShieldX className="w-5 h-5" />
              {isSuspended ? 'Cuenta suspendida' : 'Suspender cuenta'}
            </button>
          </div>
        </div>
      </div>

      <SuspendUserModal
        isOpen={showModal}
        userName={REPORTED_USER.name}
        onConfirm={handleConfirmSuspension}
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
