import { Link } from "react-router-dom";
import { Crown, UserMinus } from "lucide-react";
import { Avatar } from "@/components/ui";
import type { GroupMemberDto } from "../types/contracts";

export interface GroupMembersListProps {
  members: GroupMemberDto[];
  isLeader: boolean;
  currentUserId: string;
  busy: boolean;
  onTransfer: (id: string, name: string) => void;
  onKick: (id: string, name: string) => void;
}
/** Muestra únicamente miembros reales y expone acciones de liderazgo con nombres accesibles. */
export function GroupMembersList({
  members,
  isLeader,
  currentUserId,
  busy,
  onTransfer,
  onKick,
}: GroupMembersListProps) {
  return (
    <section className="panel">
      <div className="section-title">
        <h2>Integrantes</h2>
        <span className="count">{members.length}</span>
      </div>
      {members.map((member) => (
        <div className="member-row" key={member.userId}>
          <Link to={`/perfil/${member.userId}`} className="person">
            <Avatar
              name={member.name}
              src={member.profilePhotoUrl || undefined}
            />
            <div>
              <strong>
                {member.name}
                {member.userId === currentUserId ? " (tú)" : ""}
              </strong>
              <span>
                {member.role === "leader" ? "Líder del grupo" : "Integrante"}
              </span>
            </div>
          </Link>
          {isLeader && member.userId !== currentUserId && (
            <div className="button-row">
              <button
                type="button"
                className="icon-button"
                disabled={busy}
                aria-label={`Transferir liderazgo a ${member.name}`}
                title="Transferir liderazgo"
                onClick={() => onTransfer(member.userId, member.name)}
              >
                <Crown size={17} />
              </button>
              <button
                type="button"
                className="icon-button danger"
                disabled={busy}
                aria-label={`Expulsar a ${member.name}`}
                title="Expulsar integrante"
                onClick={() => onKick(member.userId, member.name)}
              >
                <UserMinus size={17} />
              </button>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
