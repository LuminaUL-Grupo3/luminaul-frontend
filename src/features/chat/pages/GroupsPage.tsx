import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useResource } from "@/hooks/useResource";
import { PageHeader, Loading, Notice, Empty } from "@/components/ui";
import { Group } from "../types";
import { GroupCard } from "../components";

export function GroupsPage() {
  const groups = useResource<Group[]>("/groups", []);
  return (
    <>
      <PageHeader
        eyebrow="TU COMUNIDAD"
        title="Mis grupos de estudio"
        description="Cada grupo es una oportunidad para avanzar juntos."
        action={
          <Link className="button secondary" to="/buscar">
            Encontrar un grupo <ArrowUpRight size={18} />
          </Link>
        }
      />
      <Notice error>{groups.error}</Notice>
      {groups.loading ? (
        <Loading />
      ) : groups.data.length ? (
        <div className="group-grid">
          {groups.data.map((g, i) => (
            <GroupCard key={g.id} group={g} colorToneIndex={i} />
          ))}
        </div>
      ) : (
        <Empty title="Aún no te has unido a un grupo">
          Busca una publicación y envía una solicitud, o crea tu propio grupo.
        </Empty>
      )}
    </>
  );
}
