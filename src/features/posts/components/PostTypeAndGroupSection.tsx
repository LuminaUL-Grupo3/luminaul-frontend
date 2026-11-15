import {
  AlertCircle,
  GraduationCap,
  Laptop,
  Link2,
  MapPin,
  Moon,
  Sparkles,
  Sun,
  Sunset,
  Users,
} from "lucide-react";
import { Field } from "@/components/ui";
import {
  PostGroupSummary,
  PostMeetingMode,
  PostMeetingShift,
  PostType,
} from "../types";

const MODE_OPTIONS: {
  value: PostMeetingMode;
  label: string;
  Icon: typeof Laptop;
}[] = [
  { value: "virtual", label: "Virtual", Icon: Laptop },
  { value: "presencial", label: "Presencial", Icon: MapPin },
  { value: "hibrido", label: "Híbrido", Icon: Sparkles },
];

const SHIFT_OPTIONS: {
  value: PostMeetingShift;
  label: string;
  Icon: typeof Sun;
}[] = [
  { value: "manana", label: "Mañana", Icon: Sun },
  { value: "tarde", label: "Tarde", Icon: Sunset },
  { value: "noche", label: "Noche", Icon: Moon },
];

interface PostTypeAndGroupSectionProps {
  isEditing: boolean;
  type: PostType;
  groupMode: "new" | "existing";
  groupId: string;
  maxCapacity: number;
  meetingMode: PostMeetingMode;
  meetingShift: PostMeetingShift;
  myGroups: PostGroupSummary[];
  selectedGroup: PostGroupSummary | null;
  groupError?: string;
  onChangeField: (
    key: "type" | "groupId" | "maxCapacity" | "meetingMode" | "meetingShift",
    value: string | number,
  ) => void;
  onChangeGroupMode: (mode: "new" | "existing") => void;
}

export function PostTypeAndGroupSection({
  isEditing,
  type,
  groupMode,
  groupId,
  maxCapacity,
  meetingMode,
  meetingShift,
  myGroups,
  selectedGroup,
  groupError,
  onChangeField,
  onChangeGroupMode,
}: PostTypeAndGroupSectionProps) {
  return (
    <>
      <Field
        label="1. Tipo de Publicación"
        hint={
          isEditing
            ? "El tipo de publicación no se puede cambiar una vez creada."
            : undefined
        }
      >
        <select
          aria-label="Tipo de publicación"
          className="sr-only"
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            opacity: 0,
          }}
          disabled={isEditing}
          value={type}
          onChange={(e) => {
            if (!isEditing) onChangeField("type", e.target.value as PostType);
          }}
        >
          <option value="study_group">Grupo de Estudio</option>
          <option value="tutoring">Asesoría</option>
        </select>

        <div
          className="type-card-grid"
          role="radiogroup"
          aria-label="Tipo de publicación"
        >
          <div
            role="radio"
            aria-checked={type === "study_group"}
            aria-disabled={isEditing}
            tabIndex={isEditing ? -1 : 0}
            className={`type-card-option ${
              type === "study_group" ? "selected" : ""
            }${isEditing ? " locked" : ""}`}
            onClick={() => {
              if (!isEditing) onChangeField("type", "study_group");
            }}
            onKeyDown={(e) => {
              if (!isEditing && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onChangeField("type", "study_group");
              }
            }}
          >
            <div className="type-card-header">
              <div className="type-card-icon">
                <Users size={22} />
              </div>
              <span className="type-card-badge">Grupo colaborativo</span>
            </div>
            <h3 className="type-card-title">Grupo de Estudio</h3>
            <p className="type-card-desc">
              Crea un espacio de estudio compartido para preparar exámenes,
              repasar guías y trabajar en equipo.
            </p>
          </div>

          <div
            role="radio"
            aria-checked={type === "tutoring"}
            aria-disabled={isEditing}
            tabIndex={isEditing ? -1 : 0}
            className={`type-card-option ${
              type === "tutoring" ? "selected" : ""
            }${isEditing ? " locked" : ""}`}
            onClick={() => {
              if (!isEditing) onChangeField("type", "tutoring");
            }}
            onKeyDown={(e) => {
              if (!isEditing && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onChangeField("type", "tutoring");
              }
            }}
          >
            <div className="type-card-header">
              <div className="type-card-icon">
                <GraduationCap size={22} />
              </div>
              <span className="type-card-badge">Acompañamiento</span>
            </div>
            <h3 className="type-card-title">Asesoría Académica</h3>
            <p className="type-card-desc">
              Brinda u ofrece soporte temático y mentoría personalizada en
              materias específicas de la malla.
            </p>
          </div>
        </div>
      </Field>

      {type === "study_group" && (
        <>
          <Field label="Modalidad del Grupo de Estudio">
            <div
              className="group-mode-toggle"
              role="radiogroup"
              aria-label="Modalidad del grupo de estudio"
            >
            <button
              type="button"
              role="radio"
              aria-checked={groupMode === "new"}
              className={`group-mode-btn ${groupMode === "new" ? "active" : ""}`}
              onClick={() => {
                onChangeGroupMode("new");
                onChangeField("groupId", "");
              }}
            >
              <Sparkles size={18} />
              <div>
                <strong style={{ display: "block" }}>Crear nuevo grupo</strong>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Auto-generado para el curso seleccionado
                </span>
              </div>
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={groupMode === "existing"}
              className={`group-mode-btn ${
                groupMode === "existing" ? "active" : ""
              }`}
              onClick={() => onChangeGroupMode("existing")}
            >
              <Link2 size={18} />
              <div>
                <strong style={{ display: "block" }}>
                  Vincular grupo existente
                </strong>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Usa un grupo que ya tienes activo
                </span>
              </div>
            </button>
          </div>
          </Field>

          {(groupMode === "new" || isEditing) && (
            <div className="group-capacity-inline" style={{ marginTop: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <label
                  style={{ fontSize: 13, fontWeight: 600, color: "#334155" }}
                >
                  Capacidad Máxima del Grupo
                </label>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Mín. 2 y máx. 8 integrantes (incluye al líder)
                </span>
              </div>
              <div className="capacity-control-box">
                <div className="capacity-slider-wrap">
                  <input
                    type="range"
                    min={2}
                    max={8}
                    step={1}
                    value={maxCapacity}
                    onChange={(e) => {
                      const val = Math.min(8, Math.max(2, Number(e.target.value)));
                      onChangeField("maxCapacity", val);
                    }}
                    aria-label="Capacidad del grupo"
                  />
                  <input
                    type="number"
                    min={2}
                    max={8}
                    value={maxCapacity}
                    onChange={(e) => {
                      const val = Math.min(8, Math.max(2, Number(e.target.value)));
                      onChangeField("maxCapacity", val);
                    }}
                    style={{ width: 80, textAlign: "center" }}
                    aria-label="Número de integrantes"
                  />
                </div>
              </div>

              {groupMode === "new" && !isEditing && (
                <div className="post-group-schedule-grid">
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: 6,
                      }}
                    >
                      Modalidad de reunión
                    </label>
                    <div
                      className="post-pill-group"
                      role="radiogroup"
                      aria-label="Modalidad del grupo"
                    >
                      {MODE_OPTIONS.map(({ value, label, Icon }) => (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={meetingMode === value}
                          className={`post-pill-option${meetingMode === value ? " is-active" : ""}`}
                          onClick={() => onChangeField("meetingMode", value)}
                        >
                          <Icon size={14} aria-hidden="true" />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#334155",
                        marginBottom: 6,
                      }}
                    >
                      Turno preferido
                    </label>
                    <div
                      className="post-pill-group"
                      role="radiogroup"
                      aria-label="Turno del grupo"
                    >
                      {SHIFT_OPTIONS.map(({ value, label, Icon }) => (
                        <button
                          key={value}
                          type="button"
                          role="radio"
                          aria-checked={meetingShift === value}
                          className={`post-pill-option${meetingShift === value ? " is-active" : ""}`}
                          onClick={() => onChangeField("meetingShift", value)}
                        >
                          <Icon size={14} aria-hidden="true" />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {groupMode === "existing" && (
            <div className="group-select-container">
              {myGroups.length === 0 ? (
                <div className="empty-groups-notice">
                  <AlertCircle size={16} />
                  <span>
                    Aún no perteneces a ningún grupo de estudio. Elige "Crear
                    nuevo grupo" para generarlo automáticamente.
                  </span>
                </div>
              ) : (
                <>
                  <select
                    aria-label="Seleccionar grupo existente"
                    className={`existing-group-select ${
                      groupError ? "input-error" : ""
                    }`}
                    value={groupId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      onChangeField("groupId", selectedId);
                      const grp = myGroups.find((g) => g.id === selectedId);
                      if (grp && typeof grp.maxCapacity === "number") {
                        onChangeField(
                          "maxCapacity",
                          Math.min(8, Math.max(2, grp.maxCapacity)),
                        );
                      }
                    }}
                  >
                    <option value="">
                      -- Selecciona un grupo existente --
                    </option>
                    {myGroups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}{" "}
                        {g.myRole === "leader" ? "(Líder)" : "(Miembro)"} •{" "}
                        {g.currentMembers ?? 1} miembros
                      </option>
                    ))}
                  </select>
                  {groupError && (
                    <div className="field-error-message">
                      <AlertCircle size={15} />
                      <span>{groupError}</span>
                    </div>
                  )}
                  {selectedGroup && (
                    <div className="selected-group-card">
                      <Users size={16} />
                      <span>
                        Vinculado a: <strong>{selectedGroup.name}</strong> •
                        Capacidad: {selectedGroup.maxCapacity ?? 6} integrantes
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
}

