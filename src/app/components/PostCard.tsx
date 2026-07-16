import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Edit2,
  Trash2,
  Clock,
  Users,
  BookOpen,
  MoreVertical,
  Flag,
} from 'lucide-react';
import { ReportContentModal } from './ReportContentModal';
import { Toast } from './Toast';

interface PostCardProps {
  id: string;
  authorId: string;
  author: string;
  authorAvatar?: string | null;
  postType: 'Asesoría' | 'Grupo de Estudio';
  course: string;
  studyGroup: string;
  description: string;
  timeAgo: string;
  isOwn?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

function PostMenu({
  isOwn,
  onEdit,
  onDelete,
  onReport,
}: {
  isOwn: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handler);

    return () => {
      document.removeEventListener('mousedown', handler);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Opciones"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-48 bg-white rounded-lg border border-border shadow-lg py-1.5 z-20 animate-in fade-in slide-in-from-top-2">
          {isOwn ? (
            <>
              <button
                onClick={() => {
                  setOpen(false);
                  onEdit?.();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors text-left"
              >
                <Edit2 className="w-4 h-4 text-muted-foreground" />
                Editar publicación
              </button>

              <div className="my-1 border-t border-border" />

              <button
                onClick={() => {
                  setOpen(false);
                  onDelete?.();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-destructive hover:bg-red-50 transition-colors text-left"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar publicación
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setOpen(false);
                onReport();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-red-50 transition-colors text-left"
            >
              <Flag className="w-4 h-4" />
              Reportar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function PostCard({
  id,
  authorId,
  author,
  authorAvatar,
  postType,
  course,
  studyGroup,
  description,
  timeAgo,
  isOwn = false,
  onEdit,
  onDelete,
}: PostCardProps) {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [reported, setReported] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleReport = () => {
    setShowModal(true);
  };

  const handleConfirmReport = () => {
    setShowModal(false);
    setReported(true);
    setToastMsg('Tu reporte fue enviado con éxito.');
    setShowToast(true);
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-border p-6 hover:border-primary/30 transition-colors">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                !isOwn && navigate(`/perfil/estudiante/${authorId}`)
              }
              className={`w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${
                !isOwn
                  ? 'hover:bg-primary/20 transition-colors'
                  : ''
              }`}
            >
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={`Foto de ${author}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-primary font-semibold">
                  {author.charAt(0).toUpperCase()}
                </span>
              )}
            </button>

            <div>
              <button
                type="button"
                onClick={() =>
                  !isOwn && navigate(`/perfil/estudiante/${authorId}`)
                }
                className={`font-semibold text-left ${
                  !isOwn
                    ? 'hover:text-primary transition-colors'
                    : ''
                }`}
              >
                {author}
              </button>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{timeAgo}</span>
              </div>
            </div>
          </div>

          <PostMenu
            isOwn={isOwn}
            onEdit={onEdit}
            onDelete={onDelete}
            onReport={handleReport}
          />
        </div>

        <div className="mb-4">
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm ${
              postType === 'Asesoría'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-purple-100 text-purple-700'
            }`}
          >
            {postType}
          </span>

          {reported && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Flag className="w-3 h-3" />
              Reportada
            </span>
          )}
        </div>

        <p className="text-foreground mb-4 leading-relaxed">
          {description}
        </p>

        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BookOpen className="w-4 h-4" />
            <span>{course}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{studyGroup}</span>
          </div>
        </div>
      </div>

      <ReportContentModal
        isOpen={showModal}
        contentType="publicación"
        alreadyReported={reported}
        onConfirm={handleConfirmReport}
        onCancel={() => setShowModal(false)}
      />

      {showToast && (
        <Toast
          message={toastMsg}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
