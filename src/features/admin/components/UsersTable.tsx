import { useDeferredValue, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Loading, Notice, Empty } from "@/components/ui";
import { useAdminUsersQuery } from "../hooks/useAdminQueries";
import { AdminAccountStatus, AdminUserListItemDto } from "../types";
import { SuspendUserModal } from "./SuspendUserModal";

const STATUS_LABELS: Record<AdminAccountStatus, string> = {
  active: "Activo",
  suspended: "Suspendido",
  pending_verification: "Pendiente de verificación",
  deleted: "Eliminado",
};

// HU 7.1: gestión de cuentas (la búsqueda se hace en el servidor)
export function UsersTable() {
  const [search, setSearch] = useState(""),
    [status, setStatus] = useState(""),
    [selected, setSelected] = useState<AdminUserListItemDto | null>(null);
  const deferredSearch = useDeferredValue(search.trim());
  const users = useAdminUsersQuery({ search: deferredSearch, status });
  const items = users.data?.items ?? [];

  return (
    <>
      <div className="button-row">
        <input
          className="search-bar"
          aria-label="Buscar usuario"
          placeholder="Buscar por nombre o correo"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          aria-label="Filtrar por estado"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="suspended">Suspendidos</option>
          <option value="pending_verification">Pendientes de verificación</option>
        </select>
      </div>
      <Notice error>{users.error?.message}</Notice>
      {users.isLoading ? (
        <Loading />
      ) : items.length ? (
        <div className="panel table-wrap">
          <table>
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.name}</strong>
                    <small>{u.email}</small>
                  </td>
                  <td>
                    <span className="tag">
                      {u.role === "admin" ? "Administrador" : STATUS_LABELS[u.status]}
                    </span>
                    {u.suspensionReason && <small>{u.suspensionReason}</small>}
                  </td>
                  <td>
                    {u.role === "student" && ["active", "suspended"].includes(u.status) && (
                      <button className="text-button" onClick={() => setSelected(u)}>
                        {u.status === "suspended" ? (
                          <>
                            <RotateCcw size={15} />
                            Reactivar
                          </>
                        ) : (
                          "Suspender"
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty title="No se encontraron usuarios" />
      )}
      {selected && (
        <SuspendUserModal
          user={selected}
          suspend={selected.status !== "suspended"}
          close={() => setSelected(null)}
        />
      )}
    </>
  );
}
