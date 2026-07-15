import { useNavigate, useParams } from 'react-router';
import {
  User, GraduationCap, Mail, Star, MessageSquare,
  ArrowRight, BookOpen,
} from 'lucide-react';

// Datos simulados del estudiante público
const STUDENT = {
  name: 'Andrea Quispe Torres',
  career: 'Ingeniería de Sistemas',
  email: 'a.quispe@aloe.ulima.edu.pe',
  ciclo: '6',
  bio: 'Apasionada por la programación y el diseño de sistemas. Ofrezco asesorías en algoritmos, estructuras de datos y desarrollo web.',
  avgRating: 4.3,
  reviewCount: 18,
};

const RECENT_REVIEWS = [
  { id: 1, author: 'Carlos Mendoza',  rating: 5, comment: 'Explica muy bien los ejercicios y siempre llega puntual.',              date: '15 jun 2025' },
  { id: 2, author: 'Valeria Soto',    rating: 4, comment: 'Muy buen compañero para estudiar, respondió todas mis dudas.',           date: '8 jun 2025'  },
  { id: 3, author: 'Diego Huanca',    rating: 5, comment: 'Excelente asesora, muy paciente y con dominio del tema.',                date: '1 jun 2025'  },
];

function StarRow({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4';
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

export function PublicProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Cabecera del perfil */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 border-b border-border">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold mb-1">{STUDENT.name}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <GraduationCap className="w-4 h-4" />
                <span className="text-sm">{STUDENT.career} · Ciclo {STUDENT.ciclo}</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <StarRow value={STUDENT.avgRating} size="sm" />
                <span className="text-sm font-semibold">{STUDENT.avgRating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">
                  ({STUDENT.reviewCount} reseñas)
                </span>
              </div>
              <p className="text-sm text-muted-foreground max-w-lg">{STUDENT.bio}</p>
            </div>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="px-8 py-5 flex items-center gap-3 flex-wrap">
          <button
            onClick={() => navigate(`/grupos`)}
            className="flex items-center gap-2 h-11 px-5 border border-border rounded-lg hover:border-primary hover:text-primary transition-colors text-sm font-medium"
          >
            <BookOpen className="w-4 h-4" />
            Solicitar asesoría
          </button>
          <button
            onClick={() => navigate(`/mensajes`)}
            className="flex items-center gap-2 h-11 px-5 border border-border rounded-lg hover:border-primary hover:text-primary transition-colors text-sm font-medium"
          >
            <MessageSquare className="w-4 h-4" />
            Enviar mensaje
          </button>
          <button
            onClick={() => navigate(`/perfil/${id ?? 'andrea-01'}/resena`)}
            className="flex items-center gap-2 h-11 px-5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            <Star className="w-4 h-4" />
            Escribir reseña
          </button>
        </div>
      </div>

      {/* Información personal */}
      <div className="bg-white rounded-xl border border-border p-8">
        <h3 className="text-xl font-medium mb-6">Información personal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Correo institucional</p>
              <p className="font-medium">{STUDENT.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Carrera</p>
              <p className="font-medium">{STUDENT.career}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bloque de reputación */}
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-medium">Reputación</h3>
          <button
            onClick={() => navigate(`/perfil/${id ?? 'andrea-01'}/resenas`)}
            className="flex items-center gap-1.5 text-sm text-primary hover:opacity-70 transition-opacity font-medium"
          >
            Ver todas las reseñas
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Promedio */}
        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-border">
          <div className="flex flex-col items-center gap-1">
            <span className="text-5xl font-bold text-foreground">{STUDENT.avgRating.toFixed(1)}</span>
            <StarRow value={STUDENT.avgRating} size="md" />
            <span className="text-xs text-muted-foreground mt-0.5">
              {STUDENT.reviewCount} reseñas
            </span>
          </div>

          {/* Barras por estrella */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((s) => {
              const counts: Record<number, number> = { 5: 10, 4: 5, 3: 2, 2: 1, 1: 0 };
              const pct = Math.round((counts[s] / STUDENT.reviewCount) * 100);
              return (
                <div key={s} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-3 text-right">{s}</span>
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-4 text-right">{counts[s]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vista previa de últimas reseñas */}
        <div className="space-y-4">
          {RECENT_REVIEWS.map((review) => (
            <div key={review.id} className="border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight">{review.author}</p>
                    <p className="text-xs text-muted-foreground">{review.date}</p>
                  </div>
                </div>
                <StarRow value={review.rating} size="sm" />
              </div>
              <p className="text-sm text-foreground leading-relaxed pl-10">{review.comment}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate(`/perfil/${id ?? 'andrea-01'}/resenas`)}
          className="mt-4 w-full h-10 border border-border rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors font-medium"
        >
          Ver todas las reseñas ({STUDENT.reviewCount})
        </button>
      </div>
    </div>
  );
}
