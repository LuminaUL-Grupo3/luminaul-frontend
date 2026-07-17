import { useEffect, useState } from 'react';
import { PostCard } from '../components/PostCard';
import { useNavigate } from 'react-router';
import { Trash2, FileText } from 'lucide-react';
import { env } from '../../config/env';

interface ApiPost {
  id: string;
  type: 'study_group' | 'tutoring';
  description: string;
  group_id: string | null;
  status: string;
  created_at: string;
  course: {
    id: string;
    name: string;
    cycle: number;
  };
}

interface Post {
  id: string;
  authorId: string;
  author: string;
  postType: 'Asesoría' | 'Grupo de Estudio';
  course: string;
  studyGroup: string;
  description: string;
  timeAgo: string;
}



const DEMO_USER_ID = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

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

export function MyPostsPage() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);
  const [postToDelete, setPostToDelete] =
    useState<string | null>(null);

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `${env.apiUrl}/posts/me?limit=15&offset=0`
        );

        if (!response.ok) {
          throw new Error(
            `No se pudieron obtener las publicaciones. Código: ${response.status}`
          );
        }

        const apiPosts: ApiPost[] = await response.json();

        const formattedPosts: Post[] = apiPosts.map((post) => ({
          id: post.id,
          authorId: DEMO_USER_ID,
          author: 'Tú',
          postType:
            post.type === 'tutoring'
              ? 'Asesoría'
              : 'Grupo de Estudio',
          course: post.course.name,
          studyGroup: `Ciclo ${post.course.cycle}`,
          description: post.description,
          timeAgo: getTimeAgo(post.created_at),
        }));

        setPosts(formattedPosts);
      } catch (error) {
        console.error(
          'Error al cargar mis publicaciones:',
          error
        );

        setError(
          'No se pudieron cargar tus publicaciones. Verifica que el backend esté encendido.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyPosts();
  }, []);

  const handleEdit = (post: Post) => {
    navigate(`/editar/${post.id}`, {
      state: { post },
    });
  };

  const handleDelete = (postId: string) => {
    setPostToDelete(postId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!postToDelete) {
      return;
    }

    /*
      Por ahora solo se retira visualmente.
      La conexión con DELETE /api/v1/posts/{post_id}
      corresponde a la funcionalidad de eliminación.
    */
    setPosts((currentPosts) =>
      currentPosts.filter(
        (post) => post.id !== postToDelete
      )
    );

    setShowDeleteConfirm(false);
    setPostToDelete(null);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">
          Mis Publicaciones
        </h1>

        <p className="text-muted-foreground">
          Gestiona tus publicaciones creadas
        </p>
      </div>

      {isLoading && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            Cargando tus publicaciones...
          </p>
        </div>
      )}

      {!isLoading && error && (
        <div className="text-center py-16">
          <p className="text-destructive mb-2">
            {error}
          </p>

          <p className="text-sm text-muted-foreground">
            Revisa la consola del navegador para ver más
            detalles.
          </p>
        </div>
      )}

      {!isLoading && !error && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              {...post}
              isOwn={true}
              onEdit={() => handleEdit(post)}
              onDelete={() => handleDelete(post.id)}
            />
          ))}
        </div>
      )}

      {!isLoading && !error && posts.length === 0 && (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />

          <h3 className="text-xl mb-2">
            No tienes publicaciones aún
          </h3>

          <p className="text-muted-foreground">
            Crea tu primera publicación para compartir con la
            comunidad
          </p>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-border max-w-md w-full mx-4 p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-destructive" />
              </div>

              <h2 className="text-2xl mb-2">
                ¿Eliminar publicación?
              </h2>

              <p className="text-muted-foreground">
                La publicación se retirará de la vista.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 h-12 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
              >
                Eliminar
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setPostToDelete(null);
                }}
                className="flex-1 h-12 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}