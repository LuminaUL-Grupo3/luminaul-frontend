import {
  BookOpen,
  CheckCircle2,
  Eye,
  GraduationCap,
  Sparkles,
  Users,
} from "lucide-react";
import { Course, PostGroupSummary, PostType } from "../types";
import { formatCourseName } from "../utils/formatCourseName";

interface PostLivePreviewProps {
  color: string;
  type: PostType;
  groupMode: "new" | "existing";
  selectedGroup: PostGroupSummary | null;
  activeCourse: Course | null;
  description: string;
  benefits: string;
  requirements: string;
  maxCapacity: number;
  displayAuthorName: string;
  displayAuthorPhoto: string | null;
  authorInitials: string;
  isEditing: boolean;
}

export function PostLivePreview({
  color,
  type,
  groupMode,
  selectedGroup,
  activeCourse,
  description,
  benefits,
  requirements,
  maxCapacity,
  displayAuthorName,
  displayAuthorPhoto,
  authorInitials,
  isEditing,
}: PostLivePreviewProps) {
  return (
    <aside className="live-preview-panel">
      <div className="live-preview-header">
        <span className="live-preview-label">
          <Eye size={15} />
          Vista Previa en Vivo
        </span>
        <span className="badge">Tiempo Real</span>
      </div>

      <div className="panel live-preview-card">
        <article
          className="post-card"
          data-color={color}
          style={{ margin: 0, border: "none", boxShadow: "none" }}
        >
          <div className="post-top">
            <div className="person">
              {displayAuthorPhoto ? (
                <img
                  src={displayAuthorPhoto}
                  alt={displayAuthorName}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  className="avatar"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "#0f172a",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {authorInitials}
                </div>
              )}
              <div>
                <strong>{displayAuthorName}</strong>
                <span>
                  {isEditing
                    ? "Autor de la publicación"
                    : "Tu perfil (Vista previa)"}
                </span>
              </div>
            </div>
          </div>

          <div className="tags" style={{ marginTop: 12 }}>
            <span className={`tag ${type === "tutoring" ? "purple" : ""}`}>
              {type === "tutoring" ? "Asesoría" : "Grupo de Estudio"}
            </span>
            <span className="course-tag">
              {activeCourse
                ? formatCourseName(activeCourse.name)
                : "Selecciona un curso"}
            </span>
            {activeCourse?.cycle && (
              <span className="tag">
                {activeCourse.cycle === 11
                  ? "Electivo"
                  : `Ciclo ${activeCourse.cycle}`}
              </span>
            )}
            {type === "study_group" &&
              groupMode === "existing" &&
              selectedGroup && (
                <span
                  className="tag"
                  style={{
                    background: "#e0f2fe",
                    color: "#0369a1",
                    border: "1px solid #bae6fd",
                  }}
                >
                  Vinculado: {selectedGroup.name}
                </span>
              )}
          </div>

          <p className="post-description" style={{ marginTop: 12 }}>
            {description.trim() || (
              <span className="preview-placeholder-text">
                Aquí se visualizará el objetivo y descripción de tu publicación
                conforme escribes...
              </span>
            )}
          </p>

          <div className="post-details" style={{ marginTop: 12 }}>
            {typeof activeCourse?.cycle === "number" && (
              <span>
                <BookOpen size={15} />
                {activeCourse.cycle === 11
                  ? "Electivo"
                  : `Ciclo ${activeCourse.cycle}`}
              </span>
            )}
            {type === "study_group" ? (
              <span>
                <Users size={15} />
                {groupMode === "existing" && selectedGroup
                  ? `Capacidad: ${selectedGroup.maxCapacity ?? maxCapacity} integrantes`
                  : `Hasta ${maxCapacity} integrantes (máx. 8)`}
              </span>
            ) : (
              <span>
                <GraduationCap size={15} />
                Asesoría académica
              </span>
            )}
          </div>

          {(benefits.trim() || requirements.trim()) && (
            <div
              style={{
                marginTop: 14,
                paddingTop: 12,
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                fontSize: 13,
              }}
            >
              {benefits.trim() && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 6,
                  }}
                >
                  <Sparkles
                    size={14}
                    style={{
                      color: "#d97706",
                      marginTop: 2,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <strong>Beneficios:</strong> {benefits}
                  </div>
                </div>
              )}
              {requirements.trim() && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 6,
                  }}
                >
                  <CheckCircle2
                    size={14}
                    style={{
                      color: "#2563eb",
                      marginTop: 2,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <strong>Requisitos:</strong> {requirements}
                  </div>
                </div>
              )}
            </div>
          )}
        </article>
      </div>
    </aside>
  );
}

