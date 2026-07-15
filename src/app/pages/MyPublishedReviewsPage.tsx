import { User, Star, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';

function StarRow({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
}

const REVIEWS = [
  {
    id: 1,
    studentId: 2,
    name: 'Andrea Quispe Torres',
    career: 'Ingeniería de Sistemas',
    rating: 5,
    comment: 'Explica muy bien y fue muy clara durante la sesión de estudio.',
    date: '20 jun 2025',
  },
  {
    id: 2,
    studentId: 3,
    name: 'Carlos Mendoza',
    career: 'Ingeniería Industrial',
    rating: 4,
    comment: 'Buen compañero para estudiar, resolvió mis dudas con paciencia.',
    date: '12 jun 2025',
  },
];

export function MyPublishedReviewsPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Mis reseñas publicadas</h1>
        <p className="text-muted-foreground">
          Gestiona las reseñas que dejaste sobre otros estudiantes.
        </p>
      </div>

      <div className="space-y-4">
        {REVIEWS.map((review) => (
          <div key={review.id} className="bg-white rounded-xl border border-border p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>

                <div>
                  <h3 className="font-semibold">{review.name}</h3>
                  <p className="text-sm text-muted-foreground">{review.career}</p>
                  <div className="mt-2">
                    <StarRow value={review.rating} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">{review.comment}</p>
                  <p className="text-xs text-muted-foreground mt-2">{review.date}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    navigate(`/perfil/${review.studentId}/resenas/${review.id}/editar`)
                  }
                  className="h-10 px-4 border border-border rounded-lg hover:border-primary hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>

                <button className="h-10 px-4 border border-destructive/30 text-destructive rounded-lg hover:bg-destructive/5 transition-colors flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}