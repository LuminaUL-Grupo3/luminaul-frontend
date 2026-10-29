import { Link } from "react-router-dom";
import { Users, ArrowUpRight } from "lucide-react";
import { Group } from "../types";

export interface GroupCardProps {
  group: Group;
  colorToneIndex?: number;
}

export function GroupCard({ group, colorToneIndex = 0 }: GroupCardProps) {
  return (
    <article className="group-card">
      <div className={`group-art tone-${colorToneIndex % 3}`}>
        <Users size={38} />
        <span>
          {group.role === "admin"
            ? "Administras este grupo"
            : "Tu comunidad"}
        </span>
      </div>
      <div className="group-card-body">
        <h3>{group.name}</h3>
        <p>{group.description}</p>
        <span className="small-label muted">
          {group.member_count} de {group.max_capacity} integrantes
        </span>
        <Link to={`/grupos/${group.id}`} className="button secondary full">
          Entrar al grupo <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}
