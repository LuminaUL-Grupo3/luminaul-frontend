import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  User, Star, GraduationCap, Building2, Flag,
  MessageSquareOff, ArrowLeft, Pencil, Trash2, MoreVertical,
} from 'lucide-react';
import { Toast } from '../components/Toast';
import { DeleteReviewModal } from '../components/DeleteReviewModal';
import { ReportContentModal } from '../components/ReportContentModal';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

interface Review {
  id: number;
  authorName: string;
  date: string;
  rating: number;
  comment: string;
  isOwn?: boolean;
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: 1,
    authorName: 'Carlos Mendoza',
    date: '15 jun 2025',
    rating: 5,
    comment: 'Explica muy bien los ejercicios y siempre llega puntual. Me ayudó a entender los árboles binarios que tenía pendientes desde hace semanas.',
    isOwn: true,
  },
  {
    id: 2,
    authorName: 'Valeria Soto',
    date: '8 jun 2025',
    rating: 4,
    comment: 'Muy buen compañero para estudiar, respondió todas mis dudas sobre complejidad algorítmica. Lo recomiendo.',
  },
  {
    id: 3,
    authorName: 'Diego Huanca',
    date: '1 jun 2025',
    rating: 5,
    comment: 'Excelente asesor, muy paciente y con dominio del tema. La sesión duró más de lo esperado pero valió la pena.',
  },
  {
    id: 4,
    authorName: 'Paola Rivas',
    date: '24 may 2025',
    rating: 3,
    comment: 'Conoce el tema pero a veces se desvía del punto principal. De todas formas fue útil la sesión.',
  },
];

const MY_ID = 'me';

const STUDENT = {
  name: 'Andrea Quispe Torres',
  career: 'Ingeniería de Sistemas',
  university: 'Universidad de Lima',
};

type Tab = 'info' | 'posts' | 'schedule' | 'reviews';

const TABS: { key: Tab; label: string }[] = [
  { key: 'info',     label: 'Información' },
  { key: 'posts',    label: 'Publicaciones' },
  { key: 'schedule', label: 'Horarios' },
  { key: 'reviews',  label: 'Reseñas' },
];

function StarRow({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'w-7 h-7' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${cls} ${
            i <= Math.round(value)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-transparent text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
}

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-3 text-right">{stars}</span>
      <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-400 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground w-4 text-right">{count}</span>
    </div>
  );
}

/** Menú ⋮ para reseñas propias */
function ReviewActions({
  reviewId,
  onEdit,
  onDelete,
}: {
  reviewId: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        aria-label="Opciones de reseña"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-9 w-44 bg-white rounded-lg border border-border shadow-lg py-1.5 z-20 animate-in fade-in slide-in-from-top-2">
          <button
            type="button"
            onClick={() => { setOpen(false); onEdit(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors text-left"
          >
            <Pencil className="w-4 h-4 text-muted-foreground" />
            Editar reseña
          </button>
          <div className="my-1 border-t border-border" />
          <button
            type="button"
            onClick={() => { setOpen(false); onDelete(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-red-50 transition-colors text-left"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar reseña
          </button>
        </div>
      )}
    </div>
  );
}

export function StudentReviewsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isOwnProfile = id === MY_ID || !id;

  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [activeTab, setActiveTab] = useState<Tab>('reviews');
  const [reported, setReported]           = useState<Set<number>>(new Set());
  const [reportModalId, setReportModalId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const countByStar = [5, 4, 3, 2, 1].map((s) => ({
    stars: s,
    count: reviews.filter((r) => r.rating === s).length,
  }));

  const handleReport = (reviewId: number) => {
    setReportModalId(reviewId);
  };

  const handleConfirmReport = () => {
    if (reportModalId === null) return;
    setReported((prev) => new Set(prev).add(reportModalId));
    setReportModalId(null);
    setToast({ show: true, message: 'Reporte enviado con éxito.', type: 'success' });
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteId === null) return;
    setReviews((prev) => prev.filter((r) => r.id !== pendingDeleteId));
    setPendingDeleteId(null);
    setToast({ show: true, message: 'Reseña eliminada con éxito.', type: 'success' });
  };

  return (
    <>
      <div className="max-w-3xl mx-auto">
        {/* Volver */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        {/* Cabecera del perfil */}
        <div className="bg-white rounded-xl border border-border overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 border-b border-border">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-semibold mb-1">
                  {isOwnProfile ? 'Mi Perfil' : STUDENT.name}
                </h1>
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-sm">{STUDENT.career}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm">{STUDENT.university}</span>
                </div>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <StarRow value={avgRating} size="sm" />
                    <span className="text-sm font-semibold">{avgRating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">
                      ({reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Pestañas de navegación */}
          <div className="flex border-b border-border">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
                {tab.key === 'reviews' && reviews.length > 0 && (
                  <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                    {reviews.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido de la pestaña Reseñas */}
        {activeTab === 'reviews' && (
          <div className="space-y-5">
            {/* Resumen de reputación */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-xl border border-border p-6">
                <h3 className="text-lg font-medium mb-5">
                  {isOwnProfile ? 'Mis reseñas recibidas' : 'Reputación'}
                </h3>
                <div className="flex items-center gap-8">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <span className="text-5xl font-bold text-foreground">
                      {avgRating.toFixed(1)}
                    </span>
                    <StarRow value={avgRating} size="md" />
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'}
                    </span>
                  </div>
                  <div className="flex-1 space-y-2">
                    {countByStar.map(({ stars, count }) => (
                      <RatingBar
                        key={stars}
                        stars={stars}
                        count={count}
                        total={reviews.length}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Lista de reseñas */}
            {reviews.length === 0 ? (
              <div className="bg-white rounded-xl border border-border p-12 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                  <MessageSquareOff className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-medium mb-2">Sin reseñas aún</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  {isOwnProfile
                    ? 'Aún no tienes reseñas. Participa en grupos de estudio para comenzar a recibirlas.'
                    : 'Este usuario aún no tiene reseñas.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white rounded-xl border border-border p-5 hover:shadow-sm transition-shadow"
                  >
                    {/* Cabecera de tarjeta */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold leading-tight">
                              {review.authorName}
                            </p>
                            {review.isOwn && (
                              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                                Tú
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <StarRow value={review.rating} size="sm" />
                        {/* Menú ⋮ solo para reseñas propias */}
                        {review.isOwn && (
                          <ReviewActions
                            reviewId={review.id}
                            onEdit={() =>
                              navigate(`/perfil/${id ?? 'me'}/resenas/${review.id}/editar`)
                            }
                            onDelete={() => setPendingDeleteId(review.id)}
                          />
                        )}
                      </div>
                    </div>

                    {/* Comentario */}
                    <p className="text-sm text-foreground leading-relaxed mb-4">
                      {review.comment}
                    </p>

                    {/* Reportar — solo en reseñas ajenas */}
                    {!review.isOwn && (
                      <div className="flex justify-end">
                        {reported.has(review.id) ? (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Flag className="w-3.5 h-3.5" />
                            Reportada
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleReport(review.id)}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors border border-transparent hover:border-destructive/30 rounded-md px-2 py-1"
                          >
                            <Flag className="w-3.5 h-3.5" />
                            Reportar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* CTA escribir reseña (solo en perfil ajeno) */}
            {!isOwnProfile && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    ¿Estudiaste con {STUDENT.name.split(' ')[0]}?
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Comparte tu experiencia con la comunidad
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/perfil/${id}/resena`)}
                  className="h-10 px-5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium flex-shrink-0"
                >
                  Escribir reseña
                </button>
              </div>
            )}
          </div>
        )}

        {/* Placeholders para las otras pestañas */}
        {activeTab !== 'reviews' && (
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

      {/* Modal de reporte de reseña */}
      <ReportContentModal
        isOpen={reportModalId !== null}
        contentType="reseña"
        alreadyReported={reportModalId !== null && reported.has(reportModalId)}
        onConfirm={handleConfirmReport}
        onCancel={() => setReportModalId(null)}
      />

      {/* Modal de confirmación de eliminación */}
      <DeleteReviewModal
        isOpen={pendingDeleteId !== null}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteId(null)}
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
