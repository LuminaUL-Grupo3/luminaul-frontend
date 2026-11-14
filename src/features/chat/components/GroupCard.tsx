import { Link } from "react-router-dom";
import { ArrowUpRight, BookOpen, Crown, Users } from "lucide-react";
import type { GroupDetailDto } from "../types/contracts";

export interface GroupCardProps {
  group: GroupDetailDto;
  colorToneIndex?: number;
}
/** Tarjeta de grupo con cupos reales y el rol canónico de líder o integrante. */
export function GroupCard({ group, colorToneIndex = 0 }: GroupCardProps) {
  const available = Math.max(0, group.maxCapacity - group.currentMembers);
  return (
    <article className="group-card">
      <div className={`group-art tone-${colorToneIndex % 3}`}>
        <Users size={32} />
        <span>
          {group.myStatus === "active" ? "Tu comunidad" : "Grupo de estudio"}
        </span>
      </div>
      <div className="group-card-body">
        <div className="spec04-card-course">
          <BookOpen size={14} />
          {group.courseCode}
          <span className="tag">
            {
              {
                virtual: "Virtual",
                presencial: "Presencial",
                hibrido: "Híbrido",
              }[group.meetingMode]
            }
          </span>
        </div>
        <h3 title={group.name}>{group.name}</h3>
        <p>{group.description || "Un espacio para aprender en equipo."}</p>
        <div className="spec04-card-meta">
          <span>
            <Users size={15} />
            {group.currentMembers} de {group.maxCapacity}
          </span>
          <span
            title={
              group.myRole === "leader"
                ? "Tú lideras el grupo"
                : group.leader.name
            }
          >
            <Crown size={14} />
            <span className="spec04-group-leader">
              {group.myRole === "leader"
                ? "Tú lideras el grupo"
                : group.leader.name}
            </span>
          </span>
        </div>
        <div className="spec04-group-actions">
          <div
            className="spec04-capacity"
            aria-label={`${available} ${available === 1 ? "cupo disponible" : "cupos disponibles"}`}
          >
            <progress max={group.maxCapacity} value={group.currentMembers} />
            <span>
              {group.currentMembers >= group.maxCapacity
                ? "Grupo completo"
                : `${available} ${available === 1 ? "cupo disponible" : "cupos disponibles"}`}
            </span>
          </div>
          <Link to={`/grupos/${group.id}`} className="button secondary full">
            {group.myStatus === "active" ? "Ver mi grupo" : "Conocer el grupo"}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
