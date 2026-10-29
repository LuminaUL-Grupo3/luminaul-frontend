import { Link } from "react-router-dom";
import { BookOpen, Users, Pencil, Trash2, ArrowRight, ArrowUpRight } from "lucide-react";
import { date } from "@/config/api";
import { Avatar, ReportButton } from "@/components/ui";
import { Publication } from "../types";
import { GroupMembershipStatus } from "../hooks/useGroupStatuses";

interface PostCardProps {
  post: Publication;
  currentUserId?: string;
  groupStatus?: GroupMembershipStatus;
  onRemove: (id: string) => void;
  onInterestClick: (post: Publication) => void;
}

export function PostCard({
  post: p,
  currentUserId,
  groupStatus,
  onRemove,
  onInterestClick,
}: PostCardProps) {
  const authorName = p.author?.name || p.author_name || "Estudiante";
  const authorPhoto = p.author?.profile_photo_url || p.photo_url;
  const authorId = p.author?.user_id || p.user_id || "";
  const courseName = p.course?.name || p.course_name || "Curso";
  const cycleNum = p.course?.cycle ?? p.cycle ?? 1;
  const isMine =
    (Boolean(p.user_id) && p.user_id === currentUserId) ||
    (Boolean(p.author?.user_id) && p.author?.user_id === currentUserId);

  return (
    <article className="post-card" key={p.id}>
      <div className="post-top">
        <Link className="person" to={authorId ? `/perfil/${authorId}` : "#"}>
          <Avatar name={authorName} src={authorPhoto} />
          <div>
            <strong>{authorName}</strong>
            <span>{date(p.created_at)}</span>
          </div>
        </Link>
        <ReportButton kind="publication" id={p.id} />
      </div>

      <div className="tags">
        <span className={`tag ${p.type === "tutoring" ? "purple" : ""}`}>
          {p.type === "tutoring" ? "Asesoría" : "Grupo de Estudio"}
        </span>
        <span className="course-tag">{courseName}</span>
        {p.status !== "published" && (
          <span className="tag warning">
            {p.status === "hidden" ? "Oculta" : "En revisión"}
          </span>
        )}
      </div>

      <p className="post-description">{p.description}</p>

      <div className="post-details">
        <span>
          <BookOpen size={15} />
          Ciclo {cycleNum}
        </span>
        {p.max_capacity ? (
          <span>
            <Users size={15} />
            Hasta {p.max_capacity} integrantes
          </span>
        ) : null}
      </div>

      {(p.benefits || p.requirements) && (
        <details className="post-more">
          <summary>Beneficios y requisitos</summary>
          {p.benefits && (
            <p>
              <strong>Beneficios:</strong> {p.benefits}
            </p>
          )}
          {p.requirements && (
            <p>
              <strong>Requisitos:</strong> {p.requirements}
            </p>
          )}
        </details>
      )}

      <footer className="post-actions">
        {isMine ? (
          <>
            <Link className="text-button" to={`/publicar/${p.id}`}>
              <Pencil size={16} />
              Editar publicación
            </Link>
            <button
              className="text-button danger"
              onClick={() => onRemove(p.id)}
            >
              <Trash2 size={16} />
              Borrar publicación
            </button>
          </>
        ) : p.group_id ? (
          (() => {
            if (groupStatus === "admin" || groupStatus === "member") {
              return (
                <Link className="text-button muted" to={`/grupos/${p.group_id}`}>
                  Ver grupo <ArrowUpRight size={15} />
                </Link>
              );
            }
            if (groupStatus === "pending") {
              return (
                <span className="text-button muted">
                  Solicitud pendiente
                </span>
              );
            }
            if (groupStatus === "none") {
              return (
                <button
                  className="text-button"
                  onClick={() => onInterestClick(p)}
                >
                  Me interesa <ArrowRight size={16} />
                </button>
              );
            }
            return null;
          })()
        ) : null}
      </footer>
    </article>
  );
}
