import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { days } from "@/config/api";
import { Availability } from "../types";

export interface AvailabilityScheduleProps {
  availability?: Availability[];
  own?: boolean;
}

export function AvailabilitySchedule({
  availability = [],
  own = false,
}: AvailabilityScheduleProps) {
  return (
    <div className="panel">
      <div className="section-title">
        <h2>
          <Calendar size={20} />
          Disponibilidad
        </h2>
        {own && (
          <Link className="text-button" to="/horario">
            Gestionar horario
          </Link>
        )}
      </div>
      {availability.length ? (
        <div className="availability-list">
          {availability.map((a) => (
            <div key={a.id}>
              <strong>{days[a.day_of_week - 1]}</strong>
              <span>
                {a.start_time.slice(0, 5)} – {a.end_time.slice(0, 5)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">Todavía no hay horas libres registradas.</p>
      )}
    </div>
  );
}
