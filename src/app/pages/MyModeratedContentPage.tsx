import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  User, GraduationCap, Building2, FileText, MessageSquare,
  Star, ShieldCheck, ShieldAlert, ShieldX, Bot, X,
  AlertTriangle, CheckCircle2, Clock, ExternalLink,
} from 'lucide-react';
import { Toast } from '../components/Toast';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

type StatusType  = 'Publicado' | 'En revisión' | 'Ocultado';
type ContentKind = 'Publicación' | 'Mensaje' | 'Reseña';

interface ModeratedItem {
  id: number;
  kind: ContentKind;
  excerpt: string;
  date: string;
  reason: string;
  status: StatusType;
  fullContent: string;
  recommendations: string[];
}

// Cambiar a [] para ver el estado vacío
const ITEMS: ModeratedItem[] = [
  {
    id: 1,
    kind: 'Publicación',
    excerpt: '"Este grupo es una pérdida de tiempo, todos son unos..."',
    date: '29 jun 2025',
    reason: 'Lenguaje ofensivo.',
    status: 'Ocultado',
    fullContent:
      'Este grupo es una pérdida de tiempo, todos son unos inútiles que no saben nada del tema. Busquen otro asesor.',
    recommendations: [
      'Evita expresiones que puedan percibirse como insultos o faltas de respeto.',
      'Utiliza un lenguaje constructivo al expresar tu opinión.',
      'Recuerda que LuminaUL promueve un ambiente colaborativo y respetuoso.',
    ],
  },
  {
    id: 2,
    kind: 'Mensaje',
    excerpt: '"Vendo apuntes de todos los cursos a precio especial $$$ contactar..."',
    date: '27 jun 2025',
    reason: 'Posible contenido ofensivo detectado automáticamente.',
    status: 'En revisión',
    fullContent:
      'Vendo apuntes de todos los cursos a precio especial $$$ contactar por interno para más info.',
    recommendations: [
      'El chat grupal no debe usarse con fines comerciales.',
      'Si deseas compartir recursos, utiliza la sección de publicaciones.',
      'Un moderador revisará el contenido y tomará una decisión en breve.',
    ],
  },
  {
    id: 3,
    kind: 'Reseña',
    excerpt: '"Mal asesor, probablemente las reseñas positivas son falsas."',
    date: '24 may 2025',
    reason: 'Reporte revisado y descartado.',
    status: 'Publicado',
    fullContent:
      'Mal asesor, no sé cómo tiene tantas reseñas positivas... probablemente falsas. No lo recomiendo para nada.',
    recommendations: [
      'Tu reseña fue revisada y no incumple las normas actuales.',
      'Procura basar tus opiniones en hechos concretos de la experiencia vivida.',
    ],
  },
];

// ── Chips ─────────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<StatusType, { cls: string; dot: string; icon: React.ReactNode; label: string }> = {
  'Publicado':   { cls: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500', icon: <ShieldCheck className="w-3.5 h-3.5" />, label: 'Publicado'   },
  'En revisión': { cls: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', icon: <Bot          className="w-3.5 h-3.5" />, label: 'En revisión' },
  'Ocultado':    { cls: 'bg-red-50   text-red-700   border-red-200',   dot: 'bg-red-500',   icon: <ShieldX      className="w-3.5 h-3.5" />, label: 'Ocultado'    },
};

const KIND_ICON: Record<ContentKind, React.ReactNode> = {
  'Publicación': <FileText      className="w-4 h-4 text-muted-foreground" />,
  'Mensaje':     <MessageSquare className="w-4 h-4 text-muted-foreground" />,
  'Reseña':      <Star          className="w-4 h-4 text-muted-foreground" />,
};

function StatusChip({ status }: { status: StatusType }) {
  const c = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${c.cls}`}>
      {c.icon}
      {c.label}
    </span>
  );
}

// ── Detail modal ──────────────────────────────────────────────────────────────

function DetailModal({
  item,
  onClose,
  onAppeal,
}: {
  item: ModeratedItem;
  onClose: () => void;
  onAppeal: (id: number) => void;
}) {
  const statusIcon: Record<StatusType, React.ReactNode> = {
    'Publicado':   <CheckCircle2 className="w-5 h-5 text-green-600" />,
    'En revisión': <Clock        className="w-5 h-5 text-amber-600" />,
    'Ocultado':    <ShieldAlert  className="w-5 h-5 text-destructive" />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl border border-border max-w-lg w-full mx-4 animate-in zoom-in-95 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            {KIND_ICON[item.kind]}
            <div>
              <h2 className="text-lg font-semibold leading-tight">Detalle del contenido</h2>
              <p className="text-xs text-muted-foreground">{item.kind} · {item.date}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Contenido original */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contenido original</p>
            <div className="bg-secondary rounded-lg p-4 border border-border">
              <p className="text-sm text-foreground leading-relaxed">"{item.fullContent}"</p>
            </div>
          </div>

          {/* Estado + motivo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estado actual</p>
              <div className="flex items-center gap-2">
                {statusIcon[item.status]}
                <StatusChip status={item.status} />
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fecha del evento</p>
              <p className="text-sm text-foreground">{item.date}</p>
            </div>
          </div>

          {/* Motivo */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Motivo de la moderación</p>
            <div className={`flex items-start gap-2.5 rounded-lg p-3 border ${
              item.status === 'Ocultado'    ? 'bg-red-50 border-red-200'
              : item.status === 'En revisión' ? 'bg-amber-50 border-amber-200'
              : 'bg-green-50 border-green-200'
            }`}>
              <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                item.status === 'Ocultado'    ? 'text-destructive'
                : item.status === 'En revisión' ? 'text-amber-600'
                : 'text-green-600'
              }`} />
              <p className="text-sm">{item.reason}</p>
            </div>
          </div>

          {/* Recomendaciones */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recomendaciones</p>
            <ul className="space-y-2">
              {item.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
          {item.status === 'Ocultado' && (
            <button
              onClick={() => { onClose(); onAppeal(item.id); }}
              className="flex items-center gap-2 h-10 px-5 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors text-sm font-medium"
            >
              <ShieldAlert className="w-4 h-4" />
              Solicitar apelación
            </button>
          )}
          <button
            onClick={onClose}
            className="h-10 px-5 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted transition-colors text-sm font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Tab = 'info' | 'posts' | 'schedule' | 'reviews' | 'moderated';

const TABS: { key: Tab; label: string }[] = [
  { key: 'info',      label: 'Información' },
  { key: 'posts',     label: 'Publicaciones' },
  { key: 'schedule',  label: 'Horarios' },
  { key: 'reviews',   label: 'Reseñas' },
  { key: 'moderated', label: 'Mis contenidos moderados' },
];

const STUDENT = {
  name: 'Nombre del Estudiante',
  career: 'Ingeniería de Sistemas',
  university: 'Universidad de Lima',
};

export function MyModeratedContentPage() {
  const navigate = useNavigate();

  const [activeTab,    setActiveTab]    = useState<Tab>('moderated');
  const [detailItem,   setDetailItem]   = useState<ModeratedItem | null>(null);
  const [appealed,     setAppealed]     = useState<Set<number>>(new Set());
  const [toast,        setToast]        = useState<ToastState>({ show: false, message: '', type: 'success' });

  const handleAppeal = (id: number) => {
    setAppealed((prev) => new Set(prev).add(id));
    setToast({ show: true, message: 'Solicitud de apelación enviada correctamente.', type: 'success' });
  };

  return (
    <>
      <div className="max-w-3xl mx-auto">
        {/* Cabecera del perfil */}
        <div className="bg-white rounded-xl border border-border overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 border-b border-border">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-semibold mb-1">{STUDENT.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-sm">{STUDENT.career}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm">{STUDENT.university}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pestañas */}
          <div className="flex overflow-x-auto border-b border-border">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-shrink-0 px-4 py-3.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {tab.key === 'moderated' && ITEMS.length > 0 && (
                  <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                    {ITEMS.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido pestaña activa */}
        {activeTab === 'moderated' && (
          <>
            {ITEMS.length === 0 ? (
              /* Estado vacío */
              <div className="bg-white rounded-xl border border-border p-12 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">Sin contenido moderado</h3>
                <p className="text-muted-foreground text-sm max-w-xs mb-6">
                  No tienes contenido moderado. ¡Sigue así, tu actividad cumple las normas de la comunidad!
                </p>
                <button
                  onClick={() => navigate('/perfil')}
                  className="h-10 px-6 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  Volver al perfil
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-border p-5 hover:shadow-sm transition-shadow"
                  >
                    {/* Fila superior */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                          {KIND_ICON[item.kind]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{item.kind}</p>
                          <p className="text-xs text-muted-foreground">{item.date}</p>
                        </div>
                      </div>
                      <StatusChip status={item.status} />
                    </div>

                    {/* Fragmento */}
                    <p className="text-sm text-muted-foreground italic mb-3 line-clamp-2">
                      {item.excerpt}
                    </p>

                    {/* Motivo */}
                    <div className={`flex items-start gap-2 rounded-lg px-3 py-2.5 mb-4 border ${
                      item.status === 'Ocultado'     ? 'bg-red-50 border-red-200'
                      : item.status === 'En revisión' ? 'bg-amber-50 border-amber-200'
                      : 'bg-green-50 border-green-200'
                    }`}>
                      <AlertTriangle className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${
                        item.status === 'Ocultado'     ? 'text-destructive'
                        : item.status === 'En revisión' ? 'text-amber-600'
                        : 'text-green-600'
                      }`} />
                      <p className="text-xs">{item.reason}</p>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setDetailItem(item)}
                        className="flex items-center gap-1.5 h-9 px-4 border border-border rounded-lg text-sm hover:border-primary hover:text-primary transition-colors font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Ver detalle
                      </button>

                      {item.status === 'Ocultado' && (
                        appealed.has(item.id) ? (
                          <span className="flex items-center gap-1.5 text-xs text-muted-foreground h-9 px-3">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                            Apelación enviada
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => navigate('/perfil/apelaciones')}
                            className="flex items-center gap-1.5 h-9 px-4 border border-primary text-primary rounded-lg text-sm hover:bg-primary/5 transition-colors font-medium"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Solicitar apelación
                          </button>
                        )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Placeholder para pestañas no implementadas */}
        {activeTab !== 'moderated' && (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <p className="text-muted-foreground text-sm">
              Contenido de{' '}
              <span className="font-medium">{TABS.find((t) => t.key === activeTab)?.label}</span>{' '}
              no disponible en esta vista.
            </p>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {detailItem && (
        <DetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onAppeal={handleAppeal}
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
