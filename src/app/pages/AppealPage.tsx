import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  User, GraduationCap, Building2,
  FileText, MessageSquare, Star,
  ShieldX, ShieldAlert, Clock, AlertTriangle,
  CheckCircle2, XCircle, ExternalLink,
} from 'lucide-react';
import { Toast } from '../components/Toast';
import { AppealModal } from '../components/AppealModal';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

type ContentKind    = 'Publicación' | 'Mensaje' | 'Reseña';
type AppealStatus   = 'none' | 'pending' | 'rejected';

interface AppealItem {
  id: number;
  kind: ContentKind;
  excerpt: string;
  fullContent: string;
  date: string;
  reason: string;
  appealStatus: AppealStatus;
}

const INITIAL_ITEMS: AppealItem[] = [
  {
    id: 1,
    kind: 'Publicación',
    excerpt: '"Este grupo es una pérdida de tiempo, todos son unos..."',
    fullContent: 'Este grupo es una pérdida de tiempo, todos son unos inútiles que no saben nada del tema. Busquen otro asesor.',
    date: '29 jun 2025',
    reason: 'Lenguaje ofensivo.',
    appealStatus: 'none',
  },
  {
    id: 2,
    kind: 'Mensaje',
    excerpt: '"Vendo apuntes de todos los cursos a precio especial $$$ contactar..."',
    fullContent: 'Vendo apuntes de todos los cursos a precio especial $$$ contactar por interno para más info.',
    date: '27 jun 2025',
    reason: 'Posible spam comercial detectado.',
    appealStatus: 'pending',
  },
  {
    id: 3,
    kind: 'Reseña',
    excerpt: '"Mal asesor, probablemente las reseñas positivas son falsas."',
    fullContent: 'Mal asesor, no sé cómo tiene tantas reseñas positivas... probablemente falsas.',
    date: '24 may 2025',
    reason: 'Contenido potencialmente engañoso.',
    appealStatus: 'rejected',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const KIND_ICON: Record<ContentKind, React.ReactNode> = {
  'Publicación': <FileText      className="w-4 h-4 text-muted-foreground" />,
  'Mensaje':     <MessageSquare className="w-4 h-4 text-muted-foreground" />,
  'Reseña':      <Star          className="w-4 h-4 text-muted-foreground" />,
};

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

// ── Appeal status chip ────────────────────────────────────────────────────────

function AppealChip({ status }: { status: AppealStatus }) {
  if (status === 'none') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200">
        <ShieldX className="w-3.5 h-3.5" />
        Ocultado por moderación automática
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-amber-50 text-amber-700 border-amber-200">
        <Clock className="w-3.5 h-3.5" />
        Apelación pendiente
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200">
      <XCircle className="w-3.5 h-3.5" />
      Apelación rechazada
    </span>
  );
}

// ── Appeal action button ──────────────────────────────────────────────────────

function AppealButton({
  status,
  onClick,
}: {
  status: AppealStatus;
  onClick: () => void;
}) {
  if (status === 'none') {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-2 h-9 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
      >
        <ShieldAlert className="w-4 h-4" />
        Apelar sanción
      </button>
    );
  }
  if (status === 'pending') {
    return (
      <button
        type="button"
        disabled
        className="flex items-center gap-2 h-9 px-4 bg-secondary text-muted-foreground rounded-lg text-sm font-medium cursor-not-allowed"
      >
        <CheckCircle2 className="w-4 h-4" />
        Apelación enviada
      </button>
    );
  }
  // rejected
  return (
    <button
      type="button"
      disabled
      className="flex items-center gap-2 h-9 px-4 bg-secondary text-muted-foreground rounded-lg text-sm font-medium cursor-not-allowed"
    >
      <XCircle className="w-4 h-4" />
      Apelación rechazada
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function AppealPage() {
  const navigate = useNavigate();

  const [items,       setItems]       = useState<AppealItem[]>(INITIAL_ITEMS);
  const [activeTab,   setActiveTab]   = useState<Tab>('moderated');
  const [modalItemId, setModalItemId] = useState<number | null>(null);
  const [toast,       setToast]       = useState<ToastState>({ show: false, message: '', type: 'success' });

  const modalItem = items.find((i) => i.id === modalItemId) ?? null;

  const handleAppeal = (id: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    if (item.appealStatus === 'pending') {
      setToast({ show: true, message: 'Ya existe una apelación pendiente para este contenido.', type: 'error' });
      return;
    }
    setModalItemId(id);
  };

  const handleConfirmAppeal = () => {
    if (modalItemId === null) return;
    setItems((prev) =>
      prev.map((i) => i.id === modalItemId ? { ...i, appealStatus: 'pending' } : i)
    );
    setModalItemId(null);
    setToast({ show: true, message: 'Apelación enviada al equipo de moderación.', type: 'success' });
  };

  const ocultadosCount = items.filter((i) => i.appealStatus === 'none').length;

  return (
    <>
      <div className="max-w-3xl mx-auto">
        {/* Cabecera del perfil — mismo patrón que MyModeratedContentPage */}
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
                {tab.key === 'moderated' && items.length > 0 && (
                  <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                    {items.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'moderated' && (
          <div className="space-y-5">
            {/* Banner informativo cuando hay ocultados pendientes de apelar */}
            {ocultadosCount > 0 && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Tienes {ocultadosCount} {ocultadosCount === 1 ? 'contenido ocultado' : 'contenidos ocultados'}
                  </p>
                  <p className="text-sm text-amber-700 mt-0.5">
                    Puedes solicitar una revisión manual si consideras que fue un error del sistema.
                  </p>
                </div>
              </div>
            )}

            {/* Lista de tarjetas */}
            {items.map((item) => (
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
                  <AppealChip status={item.appealStatus} />
                </div>

                {/* Fragmento */}
                <p className="text-sm text-muted-foreground italic mb-3 line-clamp-2">
                  {item.excerpt}
                </p>

                {/* Motivo */}
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-4">
                  <AlertTriangle className="w-3.5 h-3.5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">{item.reason}</p>
                </div>

                {/* Mensaje de estado adicional */}
                {item.appealStatus === 'pending' && (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 mb-4">
                    <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <p className="text-xs text-amber-700">
                      Ya existe una apelación pendiente para este contenido.
                    </p>
                  </div>
                )}
                {item.appealStatus === 'rejected' && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-4">
                    <XCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
                    <p className="text-xs text-red-700">
                      No puedes volver a apelar este contenido.
                    </p>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex items-center gap-2 flex-wrap">
                  <AppealButton
                    status={item.appealStatus}
                    onClick={() => handleAppeal(item.id)}
                  />
                  <button
                    type="button"
                    className="flex items-center gap-1.5 h-9 px-4 border border-border rounded-lg text-sm hover:border-primary hover:text-primary transition-colors font-medium"
                    onClick={() => navigate('/perfil/mis-contenidos-moderados')}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Ver detalle
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Placeholder otras pestañas */}
        {activeTab !== 'moderated' && (
          <div className="bg-white rounded-xl border border-border p-12 text-center">
            <p className="text-muted-foreground text-sm">
              Contenido de{' '}
              <span className="font-medium">
                {TABS.find((t) => t.key === activeTab)?.label}
              </span>{' '}
              no disponible en esta vista.
            </p>
          </div>
        )}
      </div>

      {/* Modal de apelación */}
      {modalItem && (
        <AppealModal
          isOpen={true}
          contentKind={modalItem.kind}
          excerpt={modalItem.excerpt}
          reason={modalItem.reason}
          onConfirm={handleConfirmAppeal}
          onCancel={() => setModalItemId(null)}
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
