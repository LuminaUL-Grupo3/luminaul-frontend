import { useState } from 'react';
import { PostCard } from './PostCard';
import { EditPostModal } from './EditPostModal';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

interface Post {
  id: string;
  author: string;
  postType: 'Asesoría' | 'Grupo de Estudio';
  course: string;
  studyGroup: string;
  description: string;
  timeAgo: string;
  isOwn: boolean;
}

export function PostsFeed() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: 'María González',
      postType: 'Asesoría',
      course: 'Matemáticas I',
      studyGroup: 'Grupo A - Mañana',
      description: 'Ofrezco asesorías de Matemáticas I para preparación de exámenes. Tengo experiencia ayudando a estudiantes con álgebra, trigonometría y geometría analítica. Las sesiones son personalizadas según tus necesidades.',
      timeAgo: 'Hace 2 horas',
      isOwn: true,
    },
    {
      id: '2',
      author: 'Carlos Ramírez',
      postType: 'Grupo de Estudio',
      course: 'Física General',
      studyGroup: 'Grupo B - Tarde',
      description: 'Buscamos más integrantes para grupo de estudio de Física General. Nos reunimos martes y jueves de 3-5 PM en la biblioteca. Repasamos ejercicios y resolvemos dudas entre todos.',
      timeAgo: 'Hace 5 horas',
      isOwn: false,
    },
    {
      id: '3',
      author: 'Ana Martínez',
      postType: 'Asesoría',
      course: 'Programación Básica',
      studyGroup: 'Grupo Virtual',
      description: 'Asesorías online de programación en Python y Java. Cubrimos desde conceptos básicos hasta estructuras de datos. Ideal para quienes están comenzando o necesitan reforzar fundamentos.',
      timeAgo: 'Hace 1 día',
      isOwn: false,
    },
  ]);

  const handleEdit = (post: Post) => {
    setEditingPost(post);
  };

  const handleDelete = (postId: string) => {
    setPostToDelete(postId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      setPosts(posts.filter(p => p.id !== postToDelete));
      setShowDeleteConfirm(false);
      setPostToDelete(null);
    }
  };

  const handleSave = (data: any) => {
    if (editingPost) {
      setPosts(posts.map(p =>
        p.id === editingPost.id
          ? { ...p, ...data }
          : p
      ));
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl mb-2">Publicaciones</h1>
          <p className="text-muted-foreground">Explora y gestiona tus publicaciones en la comunidad</p>
        </div>
        <button className="flex items-center gap-2 h-12 px-6 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <Plus className="w-5 h-5" />
          Nueva publicación
        </button>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            {...post}
            onEdit={() => handleEdit(post)}
            onDelete={() => handleDelete(post.id)}
          />
        ))}
      </div>

      {editingPost && (
        <EditPostModal
          isOpen={!!editingPost}
          onClose={() => setEditingPost(null)}
          post={editingPost}
          onSave={handleSave}
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-border max-w-md w-full mx-4 p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-2xl mb-2">¿Eliminar publicación?</h2>
              <p className="text-muted-foreground">Esta acción no se puede deshacer. La publicación será eliminada permanentemente.</p>
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
