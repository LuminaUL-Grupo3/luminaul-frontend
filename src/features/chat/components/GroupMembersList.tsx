import { Link } from "react-router-dom";
import { Crown, UserMinus } from "lucide-react";
import { Avatar } from "@/components/ui";
import { GroupMember } from "../types";

export interface GroupMembersListProps {
  members: GroupMember[];
  isAdmin: boolean;
  currentUserId?: string;
  onTransferAdmin: (userId: string, userName: string) => void;
  onExpelMember: (userId: string, userName: string) => void;
}

export function GroupMembersList({
  members,
  isAdmin,
  currentUserId,
  onTransferAdmin,
  onExpelMember,
}: GroupMembersListProps) {
  return (
    <section className="panel">
      <h2>
        Integrantes <span className="count">{members.length}</span>
      </h2>
      {members.map((m) => (
        <div className="member-row" key={m.user_id}>
          <Link to={`/perfil/${m.user_id}`} className="person">
            <Avatar name={m.name} src={m.photo_url} />
            <div>
              <strong>{m.name}</strong>
              <span>
                {m.role === "admin"
                  ? "Administrador del grupo"
                  : "Integrante"}
              </span>
            </div>
          </Link>
          {isAdmin && m.user_id !== currentUserId && (
            <div className="button-row">
              <button
                title="Transferir administración"
                className="icon-button"
                onClick={() => onTransferAdmin(m.user_id, m.name)}
              >
                <Crown size={18} />
              </button>
              <button
                className="icon-button danger"
                title="Expulsar integrante"
                onClick={() => onExpelMember(m.user_id, m.name)}
              >
                <UserMinus size={18} />
              </button>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
