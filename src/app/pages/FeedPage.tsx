import { useEffect, useState } from 'react';
import { PostCard } from '../components/PostCard';
import { BookOpen } from 'lucide-react';

interface ApiPost {
  id: string;
  type: 'study_group' | 'tutoring';
  description: string;
  group_id: string | null;
  status: string;
  created_at: string;
  author: {
    user_id: string;
    name: string;
    profile_photo_url: string | null;
  };
  course: {
    id: string;
    name: string;
    cycle: number;
  };
}

interface FeedPost {
  id: string;
  authorId: string;
  author: string;
  authorAvatar?: string | null;
  postType: 'Asesoría' | 'Grupo de Estudio';
  course: string;
  studyGroup: string;
  description: string;
  timeAgo: string;
  isOwn: boolean;
}

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

function getTimeAgo(dateString: string): string {
  const createdDate = new Date(dateString);
  const currentDate = new Date();

  const differenceInMilliseconds =
    currentDate.getTime() - createdDate.getTime();

  const differenceInMinutes = Math.floor(
    differenceInMilliseconds / (1000 * 60)
  );

  const differenceInHours = Math.floor(
    differenceInMilliseconds / (1000 * 60 * 60)
  );

  const differenceInDays = Math.floor(
    differenceInMilliseconds / (1000 * 60 * 60 * 24)
  );

  if (differenceInMinutes < 1) {
    return 'Hace unos segundos';
  }

  if (differenceInMinutes < 60) {
    return `Hace ${differenceInMinutes} ${
      differenceInMinutes === 1 ? 'minuto' : 'minutos'
    }`;
  }

  if (differenceInHours < 24) {
    return `Hace ${differenceInHours} ${
      differenceInHours === 1 ? 'hora' : 'horas'
    }`;
  }

  return `Hace ${differenceInDays} ${
    differenceInDays === 1 ? 'día' : 'días'
  }`;
}

export function FeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `${API_URL}/api/v1/posts?limit=15&offset=0`
        );

        if (!response.ok) {
          throw new Error(
            `No se pudieron obtener las publicaciones. Código: ${response.status}`
          );
        }

        const apiPosts: ApiPost[] = await response.json();

        const formattedPosts: FeedPost[] = apiPosts.map((post) => ({
          id: post.id,
          authorId: post.author.user_id,
          author: post.author.name,
          authorAvatar: post.author.profile_photo_url,
          postType:
            post.type === 'tutoring'
              ? 'Asesoría'
              : 'Grupo de Estudio',
          course: post.course.name,
          studyGroup: `Ciclo ${post.course.cycle}`,
          description: post.description,
          timeAgo: getTimeAgo(post.created_at),
          isOwn: false,
        }));

        setPosts(formattedPosts);
      } catch (error) {
        console.error('Error al cargar las publicaciones:', error);

        setError(
          'No se pudieron cargar las publicaciones. Verifica que el backend esté encendido.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">
          Feed de Publicaciones
        </h1>

        <p className="text-muted-foreground">
          Explora las últimas publicaciones de la comunidad universitaria
        </p>
      </div>

      {isLoading && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            Cargando publicaciones...
          </p>
        </div>
      )}

      {!isLoading && error && (
        <div className="text-center py-16">
          <p className="text-destructive mb-2">
            {error}
          </p>

          <p className="text-sm text-muted-foreground">
            Revisa la consola del navegador para ver más detalles.
          </p>
        </div>
      )}

      {!isLoading && !error && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              {...post}
            />
          ))}
        </div>
      )}

      {!isLoading && !error && posts.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />

          <h3 className="text-xl mb-2">
            No hay publicaciones aún
          </h3>

          <p className="text-muted-foreground">
            Sé el primero en crear una publicación
          </p>
        </div>
      )}
    </div>
  );
}