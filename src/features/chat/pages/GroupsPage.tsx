import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { PageHeader, Loading, Notice, Empty } from "@/components/ui";
import {
  useGroupsDirectoryQuery,
  useMyGroupsQuery,
} from "../hooks/useGroupQueries";
import { GroupCard } from "../components/GroupCard";
import { CreateGroupModal } from "../components/CreateGroupModal";
import type { MeetingMode } from "../types/contracts";
import { useAuthStore } from "@/features/auth/store/useAuthStore";
import "../styles/chat.css";

/** Separa Mis grupos del directorio público, conservando la identidad visual del frontend actual. */
export function GroupsPage() {
  const userId = useAuthStore((s) => s.user?.id);
  const preferenceKey = `luminaul.groups.layout.${userId}`;
  const [density, setDensity] = useState(() => {
    try {
      return localStorage.getItem(preferenceKey) === "wide"
        ? "wide"
        : "compact";
    } catch {
      return "compact";
    }
  });
  const [tab, setTab] = useState<"mine" | "directory">("mine"),
    [open, setOpen] = useState(false);
  const [courseCode, setCourseCode] = useState(""),
    [mode, setMode] = useState<MeetingMode | "">("");
  const mine = useMyGroupsQuery(),
    directory = useGroupsDirectoryQuery({
      courseCode: courseCode.trim().toUpperCase() || undefined,
      meetingMode: mode,
    });
  const rows =
    tab === "mine" ? mine.data || [] : directory.data?.pages.flat() || [];
  const query = tab === "mine" ? mine : directory;
  return (
    <div className="spec04">
      <PageHeader
        eyebrow="TU COMUNIDAD"
        title="Grupos de estudio"
        description="Encuentra a las personas con quienes quieres avanzar."
        action={
          <button className="button" onClick={() => setOpen(true)}>
            <Plus size={18} />
            Crear grupo
          </button>
        }
      />
      <div className="spec04-group-toolbar">
        <div
          className="spec04-tabs"
          role="tablist"
          aria-label="Vista de grupos"
        >
          <button
            role="tab"
            aria-selected={tab === "mine"}
            onClick={() => setTab("mine")}
          >
            Mis grupos{" "}
            {mine.data?.length ? <span>{mine.data.length}</span> : null}
          </button>
          <button
            role="tab"
            aria-selected={tab === "directory"}
            onClick={() => setTab("directory")}
          >
            Explorar grupos
          </button>
        </div>
        <label className="group-density-control">
          Tarjetas
          <select
            aria-label="Tamaño de tarjetas"
            value={density}
            onChange={(event) => {
              setDensity(event.target.value);
              try {
                localStorage.setItem(preferenceKey, event.target.value);
              } catch {
                /* Mantiene la elección durante esta sesión si no hay almacenamiento. */
              }
            }}
          >
            <option value="compact">Compactas</option>
            <option value="wide">Amplias</option>
          </select>
        </label>
        {tab === "directory" && (
          <div className="spec04-directory-filters">
            <label className="search-input">
              <Search size={17} />
              <input
                aria-label="Filtrar por código de curso"
                placeholder="Código del curso"
                value={courseCode}
                maxLength={20}
                onChange={(event) => setCourseCode(event.target.value)}
              />
            </label>
            <select
              aria-label="Filtrar por modalidad"
              value={mode}
              onChange={(event) =>
                setMode(event.target.value as MeetingMode | "")
              }
            >
              <option value="">Todas las modalidades</option>
              <option value="virtual">Virtual</option>
              <option value="presencial">Presencial</option>
              <option value="hibrido">Híbrido</option>
            </select>
          </div>
        )}
      </div>
      <Notice error>{query.error?.message}</Notice>
      {query.isError && (
        <button className="text-button" onClick={() => void query.refetch()}>
          Volver a intentar
        </button>
      )}
      {query.isPending ? (
        <Loading />
      ) : rows.length ? (
        <div className="group-grid" data-density={density}>
          {rows.map((group, index) => (
            <GroupCard key={group.id} group={group} colorToneIndex={index} />
          ))}
        </div>
      ) : (
        !query.isError && (
          <Empty
            title={
              tab === "mine"
                ? "Tu próximo grupo empieza aquí"
                : "Sin grupos con estos filtros"
            }
          >
            {tab === "mine"
              ? "Explora la comunidad o crea un espacio para estudiar con tus compañeros."
              : "Prueba otro curso o modalidad."}
            {tab === "mine" && (
              <button
                className="text-button"
                onClick={() => setTab("directory")}
              >
                Explorar grupos
              </button>
            )}
          </Empty>
        )
      )}
      {tab === "directory" && directory.hasNextPage && (
        <button
          className="button secondary"
          disabled={directory.isFetchingNextPage}
          onClick={() => void directory.fetchNextPage()}
        >
          {directory.isFetchingNextPage ? "Cargando…" : "Ver más grupos"}
        </button>
      )}
      {open && <CreateGroupModal close={() => setOpen(false)} />}
    </div>
  );
}
