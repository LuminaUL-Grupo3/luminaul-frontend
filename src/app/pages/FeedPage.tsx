import { PostCard } from '../components/PostCard';
import { BookOpen } from 'lucide-react';

export function FeedPage() {
  const posts = [
    {
      id: '1',
      author: 'María González',
      postType: 'Asesoría' as const,
      course: 'Cálculo I',
      studyGroup: 'Presencial · Mañana · 2do ciclo',
      description:
        'Ofrezco asesorías de Cálculo I para preparación de parciales. Revisaremos límites, derivadas y ejercicios tipo examen paso a paso.',
      timeAgo: 'Hace 2 horas',
      isOwn: false,
    },
    {
      id: '2',
      author: 'Carlos Ramírez',
      postType: 'Grupo de Estudio' as const,
      course: 'Física para Sistemas',
      studyGroup: 'Presencial · Tarde · 3er ciclo',
      description:
        'Buscamos integrantes para grupo de estudio de Física para Sistemas. Nos reunimos martes y jueves para resolver ejercicios y preparar prácticas calificadas.',
      timeAgo: 'Hace 5 horas',
      isOwn: false,
    },
    {
      id: '3',
      author: 'Ana Martínez',
      postType: 'Asesoría' as const,
      course: 'Introducción a la Programación',
      studyGroup: 'Virtual · Noche · 3er ciclo',
      description:
        'Asesorías virtuales de programación. Repasamos variables, condicionales, bucles, funciones y ejercicios básicos para quienes están empezando.',
      timeAgo: 'Hace 1 día',
      isOwn: false,
    },
    {
      id: '4',
      author: 'Luis Torres',
      postType: 'Grupo de Estudio' as const,
      course: 'Programación Web',
      studyGroup: 'Presencial · Noche · 6to ciclo',
      description:
        'Grupo de estudio para Programación Web. Practicaremos React, rutas, componentes, formularios y conexión con backend para prepararnos para el examen.',
      timeAgo: 'Hace 2 días',
      isOwn: false,
    },
    {
      id: '5',
      author: 'Andrea Quispe',
      postType: 'Asesoría' as const,
      course: 'Ingeniería de Software I',
      studyGroup: 'Virtual · Tarde · 7mo ciclo',
      description:
        'Brindo asesorías sobre casos de uso, diagramas UML, RUP, historias de usuario y criterios de aceptación. Ideal para repasar antes de evaluaciones.',
      timeAgo: 'Hace 3 días',
      isOwn: false,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Feed de Publicaciones</h1>
        <p className="text-muted-foreground">
          Explora las últimas publicaciones de la comunidad universitaria
        </p>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl mb-2">No hay publicaciones aún</h3>
          <p className="text-muted-foreground">Sé el primero en crear una publicación</p>
        </div>
      )}
    </div>
  );
}