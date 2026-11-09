import { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import { AvailabilitySlotDto, DAYS_OF_WEEK } from "../types";
import "../styles/profile.css";

const FIRST_HOUR = 7;
const LAST_HOUR = 22;
const TOTAL_HOURS = LAST_HOUR - FIRST_HOUR;
const HOURS = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => FIRST_HOUR + i);

// Posición de una hora HH:mm dentro de la grilla, como porcentaje de su altura
const toPercent = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return ((hours + minutes / 60 - FIRST_HOUR) / TOTAL_HOURS) * 100;
};

export interface AvailabilityScheduleProps {
  availability?: AvailabilitySlotDto[];
  own?: boolean;
  onEdit?: (slot: AvailabilitySlotDto) => void;
  onDelete?: (slot: AvailabilitySlotDto) => void;
}

export function AvailabilitySchedule({
  availability = [],
  own = false,
  onEdit,
  onDelete,
}: AvailabilityScheduleProps) {
  const editable = Boolean(onEdit || onDelete);

  return (
    <div className="panel schedule-panel">
      <div className="section-title">
        <h2>
          <Calendar size={20} />
          Disponibilidad
        </h2>
        {own && !editable && (
          <Link className="text-button" to="/horario">
            Gestionar horario
          </Link>
        )}
      </div>
      {!availability.length && (
        <p className="muted">Todavía no hay horas libres registradas.</p>
      )}
      <div className="schedule-scroll">
        <div
          className="schedule-grid"
          style={{ "--schedule-hours": TOTAL_HOURS } as CSSProperties}
        >
          <span />
          {DAYS_OF_WEEK.map((day) => (
            <span className="schedule-day-name" key={day.value}>
              {day.label}
            </span>
          ))}
          <div className="schedule-hours">
            {HOURS.map((hour) => (
              <span
                className="schedule-hour"
                key={hour}
                style={{ top: `${((hour - FIRST_HOUR) / TOTAL_HOURS) * 100}%` }}
              >
                {String(hour).padStart(2, "0")}:00
              </span>
            ))}
          </div>
          {DAYS_OF_WEEK.map((day) => (
            <div className="schedule-day" key={day.value}>
              {availability
                .filter((slot) => slot.dayOfWeek === day.value)
                .map((slot) => {
                  const top = toPercent(slot.startTime);
                  const range = `${slot.startTime} – ${slot.endTime}`;
                  return (
                    <div
                      className="schedule-slot"
                      key={slot.id}
                      title={`${day.label}, ${range}`}
                      style={{
                        top: `${top}%`,
                        height: `${toPercent(slot.endTime) - top}%`,
                      }}
                    >
                      <span>{range}</span>
                      {editable && (
                        <div className="schedule-slot-actions">
                          {onEdit && (
                            <button
                              className="icon-button"
                              title="Editar franja"
                              aria-label={`Editar franja de ${day.label}, ${range}`}
                              onClick={() => onEdit(slot)}
                            >
                              <Pencil size={11} />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              className="icon-button danger"
                              title="Eliminar franja"
                              aria-label={`Eliminar franja de ${day.label}, ${range}`}
                              onClick={() => onDelete(slot)}
                            >
                              <Trash2 size={11} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
