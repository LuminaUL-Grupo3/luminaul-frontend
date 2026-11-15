import { Link } from "react-router-dom";
import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  Users,
  Pencil,
  Trash2,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import type { CSSProperties } from "react";
import { date } from "@/config/api";
import { Avatar, ReportButton } from "@/components/ui";
import { Publication, TutoringRequestStatus } from "../types";
import { GroupMembershipStatus } from "../hooks/useGroupStatuses";
import { formatCourseName } from "../utils/formatCourseName";
import "../styles/posts.css";

const wrapTextStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  overflowWrap: "anywhere",
  wordBreak: "break-word",
  whiteSpace: "pre-wrap",
};

interface PostCardProps {
  post: Publication;
  currentUserId?: string;
  isAdmin?: boolean;
  groupStatus?: GroupMembershipStatus;
  tutoringStatus?: TutoringRequestStatus;
  tutoringGroupId?: string | null;
  onRemove: (id: string) => void;
  onInterestClick: (post: Publication) => void;
}

export function PostCard({
  post: p,
  currentUserId,
  isAdmin = false,
  groupStatus,
  tutoringStatus,
  tutoringGroupId,
  onRemove,
  onInterestClick,
}: PostCardProps) {
  const authorName = p.author?.name || "Alumno";
  const authorPhoto = p.author?.profilePhotoUrl ?? undefined;
  const authorId = p.author?.id || p.userId || "";
  const courseName = p.course?.name || "Curso";
  const cycleNum = typeof p.course?.cycle === "number" ? p.course.cycle : null;
  const maxCapacityNum = p.maxCapacity;
  const groupId = p.groupId;
  const effectiveMaxCapacity =
    typeof p.groupMaxCapacity === "number"
      ? p.groupMaxCapacity
      : maxCapacityNum;
  const isGroupFull =
    Boolean(groupId) &&
    typeof p.groupCurrentMembers === "number" &&
    typeof effectiveMaxCapacity === "number" &&
    p.groupCurrentMembers >= effectiveMaxCapacity;
  const isMine =
    (Boolean(p.userId) && p.userId === currentUserId) ||
    (Boolean(p.author?.id) && p.author?.id === currentUserId);
  const canManage = isMine || isAdmin;

  return (
    <article
      className="post-card"
      data-color={p.color || "white"}
      key={p.id}
      style={{
        borderRadius: 14,
        border: "1px solid #e2e8f0",
        boxShadow:
          "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
      }}
    >
      <div className="post-top">
        <Link className="person" to={authorId ? `/perfil/${authorId}` : "#"}>
          <Avatar name={authorName} src={authorPhoto} />
          <div>
            <strong>{authorName}</strong>
            <span>{date(p.createdAt || "")}</span>
          </div>
        </Link>
        {/* HU 6.1: no se reporta el contenido propio (igual que MessageItem en el chat) */}
        {!isMine && <ReportButton kind="publication" id={p.id} />}
      </div>

      <div className="tags" style={{ marginTop: 12 }}>
        <span className={`tag ${p.type === "tutoring" ? "purple" : ""}`}>
          {p.type === "tutoring" ? "Asesoría" : "Grupo de Estudio"}
        </span>
        <span className="course-tag">{formatCourseName(courseName)}</span>
        {p.status !== "published" && (
          <span className="tag warning">
            {p.status === "hidden" ? "Oculta por Moderación" : "Inactiva"}
          </span>
        )}
      </div>

      <p className="post-description" style={{ marginTop: 12 }}>
        {p.description}
      </p>

      <div className="post-details" style={{ marginTop: 12 }}>
        {cycleNum !== null && (
          <span>
            <BookOpen size={15} />
            {cycleNum === 11 ? "Electivo" : `Ciclo ${cycleNum}`}
          </span>
        )}
        {p.type === "tutoring" ? (
          <span>
            <GraduationCap size={15} />
            Asesoría académica
          </span>
        ) : effectiveMaxCapacity ? (
          <span>
            <Users size={15} />
            {typeof p.groupCurrentMembers === "number"
              ? isGroupFull
                ? `Grupo completo (${p.groupCurrentMembers}/${effectiveMaxCapacity})`
                : `${p.groupCurrentMembers}/${effectiveMaxCapacity} integrantes`
              : `Hasta ${effectiveMaxCapacity} integrantes`}
          </span>
        ) : null}
      </div>

      {(p.benefits?.trim() || p.requirements?.trim()) && (
        <div
          style={{
            marginTop: 14,
            marginBottom: 14,
            paddingTop: 12,
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            fontSize: 13,
            minWidth: 0,
            maxWidth: "100%",
          }}
        >
          {p.benefits?.trim() && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
              <Sparkles
                size={14}
                style={{ color: "#d97706", marginTop: 2, flexShrink: 0 }}
              />
              <div style={wrapTextStyle}>
                <strong>Beneficios:</strong> {p.benefits}
              </div>
            </div>
          )}
          {p.requirements?.trim() && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
              <CheckCircle2
                size={14}
                style={{ color: "#2563eb", marginTop: 2, flexShrink: 0 }}
              />
              <div style={wrapTextStyle}>
                <strong>Requisitos:</strong> {p.requirements}
              </div>
            </div>
          )}
        </div>
      )}

      <footer className="post-actions">
        {canManage ? (
          <>
            {isMine && !isAdmin && (
              <Link className="text-button" to={`/publicar/${p.id}`}>
                <Pencil size={16} />
                Editar publicación
              </Link>
            )}
            <button
              className="text-button danger"
              onClick={() => onRemove(p.id)}
            >
              <Trash2 size={16} />
              Borrar publicación
            </button>
          </>
        ) : p.type === "tutoring" && !groupId && !isAdmin ? (
          tutoringStatus === "pending" ? (
            <span className="text-button muted">Solicitud de asesoría pendiente</span>
          ) : tutoringStatus === "accepted" ? (
            <Link
              className="text-button muted"
              to={
                tutoringGroupId
                  ? `/mensajes/${tutoringGroupId}`
                  : authorId
                    ? `/perfil/${authorId}`
                    : "#"
              }
            >
              {tutoringGroupId
                ? "Asesoría aceptada · Ir al chat"
                : "Asesoría aceptada · Ver perfil"}{" "}
              <ArrowUpRight size={15} />
            </Link>
          ) : (
            <button
              className="text-button"
              onClick={() => onInterestClick(p)}
            >
              Me interesa <ArrowRight size={16} />
            </button>
          )
        ) : groupId && !isAdmin ? (
          (() => {
            if (groupStatus === "leader" || groupStatus === "member") {
              return (
                <Link className="text-button muted" to={`/grupos/${groupId}`}>
                  Ver grupo <ArrowUpRight size={15} />
                </Link>
              );
            }
            if (groupStatus === "pending") {
              return (
                <span className="text-button muted">Solicitud pendiente</span>
              );
            }
            if (groupStatus === "none") {
              if (isGroupFull) {
                return (
                  <span className="text-button muted" aria-disabled="true">
                    Grupo completo
                  </span>
                );
              }
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
