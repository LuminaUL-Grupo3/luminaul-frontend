import { useState } from 'react';
import { useNavigate } from 'react-router';
import { User, GraduationCap, Star, Quote } from 'lucide-react';
import { Toast } from '../components/Toast';
import { DiscardChangesModal } from '../components/DiscardChangesModal';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

// Datos de la reseña publicada originalmente (pre-cargados en el formulario)
const ORIGINAL_REVIEW = {
  rating: 4,
  comment:
    'Muy buen compañero para estudiar, respondió todas mis dudas sobre complejidad algorítmica. Lo recomiendo.',
};

const REVIEWED_STUDENT = {
  name: 'Andrea Quispe Torres',
  career: 'Ingeniería de Sistemas',
  avgRating: 4.3,
  reviewCount: 18,
};

const LABEL_BY_STARS: Record<number, string> = {
  1: 'Muy malo',
  2: 'Malo',
  3: 'Regular',
  4: 'Bueno',
  5: 'Excelente',
};

function StaticStars({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' }) {
  const sz = size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sz} ${
            i <= Math.round(value)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-transparent text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
}

export function EditReviewPage() {
  const navigate = useNavigate();

  const [rating, setRating]   = useState(ORIGINAL_REVIEW.rating);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState(ORIGINAL_REVIEW.comment);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [saved, setSaved]     = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [toast, setToast]     = useState<ToastState>({ show: false, message: '', type: 'success' });

  const activeStars = hovered || rating;

  // Detecta si hay cambios respecto al original
  const hasChanges =
    rating !== ORIGINAL_REVIEW.rating || comment !== ORIGINAL_REVIEW.comment;

  const validate = () => {
    const next: Record<string, string> = {};
    if (!comment.trim()) next.comment = 'Debe ingresar un comentario.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaved(true);
    setToast({ show: true, message: 'Reseña actualizada con éxito.', type: 'success' });
    setTimeout(() => navigate(-1), 2000);
  };

  const handleCancel = () => {
    if (hasChanges) {
      setShowDiscard(true);
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl mb-2">Editar reseña</h1>
          <p className="text-muted-foreground">
            Actualiza tu calificación o comentario sobre este estudiante
          </p>
        </div>

        {/* Tarjeta del estudiante evaluado */}
        <div className="bg-white rounded-xl border border-border overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-border">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-0.5">{REVIEWED_STUDENT.name}</h2>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-sm">{REVIEWED_STUDENT.career}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StaticStars value={REVIEWED_STUDENT.avgRating} size="sm" />
                  <span className="text-sm font-semibold text-foreground">
                    {REVIEWED_STUDENT.avgRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({REVIEWED_STUDENT.reviewCount} reseñas)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Badge indicando que es edición */}
          <div className="px-6 py-3 bg-primary/5 border-b border-border">
            <p className="text-xs text-primary font-medium">
              Estás editando una reseña publicada anteriormente
            </p>
          </div>
        </div>

        {/* Formulario */}
        {!saved && (
          <form onSubmit={handleSave} className="space-y-5">
            {/* Selector de estrellas */}
            <div className="bg-white rounded-xl border border-border p-6">
              <label className="block text-sm font-medium text-foreground mb-4">
                Calificación <span className="text-destructive">*</span>
              </label>
              <div className="flex flex-col items-center gap-3">
                <div
                  className="flex items-center gap-2"
                  onMouseLeave={() => setHovered(0)}
                >
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setRating(i);
                        setErrors((p) => ({ ...p, rating: '' }));
                      }}
                      onMouseEnter={() => setHovered(i)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                      aria-label={`${i} estrella${i > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          i <= activeStars
                            ? 'fill-amber-400 text-amber-400'
                            : 'fill-transparent text-muted-foreground/30 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {activeStars > 0 && (
                  <span className="text-sm font-medium text-amber-600">
                    {LABEL_BY_STARS[activeStars]}
                  </span>
                )}
              </div>
            </div>

            {/* Campo comentario */}
            <div className="bg-white rounded-xl border border-border p-6 space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Comentario <span className="text-destructive">*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  if (errors.comment) setErrors((p) => ({ ...p, comment: '' }));
                }}
                placeholder="Describe tu experiencia estudiando con este compañero..."
                rows={5}
                maxLength={500}
                className={`w-full px-4 py-3 bg-white border rounded-lg focus:outline-none transition-colors resize-none ${
                  errors.comment
                    ? 'border-destructive focus:border-destructive'
                    : 'border-input focus:border-primary'
                }`}
              />
              <div className="flex items-center justify-between">
                {errors.comment
                  ? <p className="text-sm text-destructive">{errors.comment}</p>
                  : <span />
                }
                <p className="text-xs text-muted-foreground ml-auto">{comment.length}/500</p>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-3 pb-8">
              <button
                type="button"
                onClick={handleCancel}
                className="h-12 px-6 border border-border rounded-lg hover:border-foreground/30 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="h-12 px-8 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Guardar cambios
              </button>
            </div>
          </form>
        )}

        {/* Vista previa post-guardado */}
        {saved && (
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-border p-6">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
                Vista previa actualizada en el perfil de {REVIEWED_STUDENT.name.split(' ')[0]}
              </p>

              <div className="border border-border rounded-xl p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Tú</p>
                      <p className="text-xs text-muted-foreground">Actualizado hoy</p>
                    </div>
                  </div>
                  <StaticStars value={rating} size="sm" />
                </div>
                <div className="relative pl-4">
                  <Quote className="absolute left-0 top-0 w-3 h-3 text-primary/40 -translate-y-0.5" />
                  <p className="text-sm text-foreground leading-relaxed">{comment}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pb-8">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="h-12 px-8 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Volver al perfil
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de descarte */}
      <DiscardChangesModal
        isOpen={showDiscard}
        onKeepEditing={() => setShowDiscard(false)}
        onDiscard={() => { setShowDiscard(false); navigate(-1); }}
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
