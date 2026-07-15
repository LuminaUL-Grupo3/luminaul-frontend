import { User, Mail, GraduationCap, Calendar, Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';

function StarRow({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= Math.round(value)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-transparent text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  );
}

const MY_RECEIVED_REVIEWS = [
  { id: 1, author: 'Carlos Mendoza', rating: 5, comment: 'Explica muy bien y siempre llega puntual.', date: '15 jun 2025' },
  { id: 2, author: 'Valeria Soto', rating: 4, comment: 'Muy buen compañero, respondió todas mis dudas.', date: '8 jun 2025' },
];

const MY_AVG = 4.3;
const MY_COUNT = 18;

export function ProfilePage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Mi Perfil</h1>
        <p className="text-muted-foreground">Información personal y académica</p>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 border-b border-border">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-2xl mb-1">Nombre del Estudiante</h2>
              <p className="text-muted-foreground">Ingeniería de Sistemas</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <h3 className="text-xl mb-6">Información Personal</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Correo institucional</p>
                <p className="font-medium">estudiante@aloe.ulima.edu.pe</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Carrera</p>
                <p className="font-medium">Ingeniería de Sistemas</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Periodo académico</p>
                <p className="font-medium">2024-1</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Código</p>
                <p className="font-medium">20221234</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate('/perfil/editar')}
              className="h-12 px-6 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Editar Perfil
            </button>

            <button
              onClick={() => navigate('/perfil/resenas-recibidas')}
              className="h-12 px-6 border border-border rounded-lg hover:border-primary hover:text-primary transition-colors font-medium"
            >
              Mis reseñas recibidas
            </button>

            <button
              onClick={() => navigate('/perfil/mis-resenas')}
              className="h-12 px-6 border border-border rounded-lg hover:border-primary hover:text-primary transition-colors font-medium"
            >
              Mis reseñas publicadas
            </button>

            <button
              onClick={() => navigate('/perfil/mis-contenidos-moderados')}
              className="h-12 px-6 border border-border rounded-lg hover:border-primary hover:text-primary transition-colors font-medium"
            >
              Contenidos moderados
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border p-6 mt-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-medium">Mis reseñas recibidas</h3>
          <button
            onClick={() => navigate('/perfil/resenas-recibidas')}
            className="flex items-center gap-1.5 text-sm text-primary hover:opacity-70 transition-opacity font-medium"
          >
            Ver todas
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-border">
          <div className="flex flex-col items-center gap-1">
            <span className="text-4xl font-bold">{MY_AVG.toFixed(1)}</span>
            <StarRow value={MY_AVG} />
            <span className="text-xs text-muted-foreground mt-0.5">{MY_COUNT} reseñas</span>
          </div>
          <p className="text-sm text-muted-foreground flex-1">
            Tu calificación promedio basada en las reseñas recibidas de otros estudiantes.
          </p>
        </div>

        <div className="space-y-4">
          {MY_RECEIVED_REVIEWS.map((r) => (
            <div key={r.id} className="border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{r.author}</p>
                    <p className="text-xs text-muted-foreground">{r.date}</p>
                  </div>
                </div>
                <StarRow value={r.rating} />
              </div>
              <p className="text-sm text-muted-foreground pl-10">{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}