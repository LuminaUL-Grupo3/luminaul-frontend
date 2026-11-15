import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Field } from "@/components/ui";
import { POST_COLORS } from "../postColors";
import { Course } from "../types";
import { formatCourseName } from "../utils/formatCourseName";
import "../styles/posts.css";

interface PostCourseAndDetailsSectionProps {
  isEditing: boolean;
  courseId: string;
  color: string;
  description: string;
  benefits: string;
  requirements: string;
  courses: Course[];
  availableCycles: number[];
  selectedCourse?: Course;
  fieldErrors: Record<string, string>;
  onCourseChange: (courseId: string) => void;
  onChangeField: (
    key: "color" | "description" | "benefits" | "requirements",
    value: string,
  ) => void;
}

export function PostCourseAndDetailsSection({
  isEditing,
  courseId,
  color,
  description,
  benefits,
  requirements,
  courses,
  availableCycles,
  selectedCourse,
  fieldErrors,
  onCourseChange,
  onChangeField,
}: PostCourseAndDetailsSectionProps) {
  return (
    <>
      <Field
        label="2. Asignatura o Curso"
        hint={
          isEditing
            ? "El curso no se puede modificar una vez creada la publicación."
            : "Selecciona la materia correspondiente a la publicación."
        }
      >
        <div
          className={`courses-category-box ${
            fieldErrors.courseId ? "has-error" : ""
          }${isEditing ? " locked" : ""}`}
        >
          <select
            required
            disabled={isEditing}
            aria-label="Curso"
            className={fieldErrors.courseId ? "input-error" : ""}
            value={courseId}
            onChange={(e) => {
              if (!isEditing) onCourseChange(e.target.value);
            }}
          >
            <option value="">Selecciona un curso</option>
            {availableCycles.map((cycleNum) => {
              const groupCourses = courses.filter((c) => c.cycle === cycleNum);
              if (groupCourses.length === 0) return null;
              return (
                <optgroup
                  key={cycleNum}
                  label={
                    cycleNum === 11
                      ? `Cursos Electivos (${groupCourses.length} cursos)`
                      : `Ciclo ${cycleNum} (${groupCourses.length} cursos)`
                  }
                >
                  {groupCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {formatCourseName(c.name)}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>

          {selectedCourse && (
            <div className="selected-course-banner">
              <div className="selected-course-info">
                <CheckCircle2 size={20} />
                <div>
                  <strong>{formatCourseName(selectedCourse.name)}</strong>
                  {selectedCourse.cycle && (
                    <span className="selected-course-tag" style={{ marginLeft: 8 }}>
                      {selectedCourse.cycle === 11
                        ? "Curso Electivo"
                        : `Ciclo ${selectedCourse.cycle}`}
                    </span>
                  )}
                </div>
              </div>
              {!isEditing && (
                <button
                  type="button"
                  className="button small secondary"
                  onClick={() => onCourseChange("")}
                >
                  Cambiar
                </button>
              )}
            </div>
          )}
        </div>

        {fieldErrors.courseId && (
          <div className="field-error-message" role="alert">
            <AlertCircle size={15} />
            <span>{fieldErrors.courseId}</span>
          </div>
        )}
      </Field>

      <fieldset className="post-color-picker">
        <legend>Color de tu publicación</legend>
        <div role="group" aria-label="Colores pastel">
          {POST_COLORS.map(([value, label, hex]) => (
            <button
              key={value}
              type="button"
              aria-label={label}
              aria-pressed={color === value}
              title={label}
              style={{ backgroundColor: hex }}
              onClick={() => onChangeField("color", value)}
            >
              {color === value ? "✓" : ""}
            </button>
          ))}
        </div>
      </fieldset>

      <Field
        label="3. Descripción Detallada"
        hint={`${description.length}/1000 caracteres`}
      >
        <textarea
          required
          maxLength={1000}
          rows={5}
          className={`post-details-textarea post-details-textarea--tall ${fieldErrors.description ? "input-error" : ""}`}
          value={description}
          onChange={(e) => onChangeField("description", e.target.value)}
          placeholder="¿Cuál es el objetivo de estudio? Describe temas específicos, horarios tentativos o metas a cumplir en equipo."
        />
        {fieldErrors.description && (
          <div className="field-error-message" role="alert">
            <AlertCircle size={15} />
            <span>{fieldErrors.description}</span>
          </div>
        )}
      </Field>

      <div className="post-details-two-cols">
        <Field
          label="Beneficios esperados"
          hint={`Qué lograrán resolver o aprender juntos (${benefits.length}/500).`}
        >
          <textarea
            required
            maxLength={500}
            rows={3}
            className={`post-details-textarea post-details-textarea--compact ${fieldErrors.benefits ? "input-error" : ""}`}
            value={benefits}
            onChange={(e) => onChangeField("benefits", e.target.value)}
            placeholder="Ejemplo: Preparar evaluaciones continuas, repasar código limpio y resolver dudas."
          />
          {fieldErrors.benefits && (
            <div className="field-error-message" role="alert">
              <AlertCircle size={15} />
              <span>{fieldErrors.benefits}</span>
            </div>
          )}
        </Field>

        <Field
          label="Requisitos sugeridos"
          hint={`Conocimientos o herramientas necesarias (${requirements.length}/500).`}
        >
          <textarea
            required
            maxLength={500}
            rows={3}
            className={`post-details-textarea post-details-textarea--compact ${fieldErrors.requirements ? "input-error" : ""}`}
            value={requirements}
            onChange={(e) => onChangeField("requirements", e.target.value)}
            placeholder="Ejemplo: Estar cursando la materia o tener instalado el entorno de desarrollo."
          />
          {fieldErrors.requirements && (
            <div className="field-error-message" role="alert">
              <AlertCircle size={15} />
              <span>{fieldErrors.requirements}</span>
            </div>
          )}
        </Field>
      </div>
    </>
  );
}

