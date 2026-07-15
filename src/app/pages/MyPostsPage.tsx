import { useState } from 'react';
import { PostCard } from '../components/PostCard';
import { useNavigate } from 'react-router';
import { Trash2, FileText } from 'lucide-react';

interface Post {
  id: string;
  author: string;
  postType: 'Asesoría' | 'Grupo de Estudio';
  course: string;
  studyGroup: string;
  description: string;
  timeAgo: string;
}

export function MyPostsPage() {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: 'Tú',
      postType: 'Asesoría',
      course: 'Matemáticas I',
      studyGroup: 'Presencial · Mañana · 1er ciclo',
      description:
        'Ofrezco asesorías de Matemáticas I para preparación de exámenes. Tengo experiencia ayudando a estudiantes con álgebra, trigonometría y geometría analítica. Las sesiones son personalizadas según tus necesidades.',
      timeAgo: 'Hace 2 horas',
    },
    {
      id: '2',
      author: 'Tú',
      postType: 'Grupo de Estudio',
      course: 'Introducción a la Programación',
      studyGroup: 'Virtual · Noche · 3er ciclo',
      description:
        'Grupo de estudio virtual para preparar el examen final de Introducción a la Programación. Nos enfocamos en resolver ejercicios prácticos y repasar conceptos fundamentales de algoritmos.',
      timeAgo: 'Hace 1 día',
    },
  ]);

  const handleEdit = (post: Post) => {
    navigate(`/editar/${post.id}`, { state: { post } });
  };

  const handleDelete = (postId: string) => {
    setPostToDelete(postId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      setPosts(posts.filter((p) => p.id !== postToDelete));
      setShowDeleteConfirm(false);
      setPostToDelete(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Mis Publicaciones</h1>
        <p className="text-muted-foreground">Gestiona tus publicaciones creadas</p>
      </div>

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

      {posts.length === 0 && (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl mb-2">No tienes publicaciones aún</h3>
          <p className="text-muted-foreground">
            Crea tu primera publicación para compartir con la comunidad
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
              <h2 className="text-2xl mb-2">¿Eliminar publicación?</h2>
              <p className="text-muted-foreground">
                Esta acción no se puede deshacer. La publicación será eliminada permanentemente.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={confirmDelete}
                className="flex-1 h-12 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
              >
                Eliminar
              </button>

              <button
                onClick={() => setShowDeleteConfirm(false)}
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