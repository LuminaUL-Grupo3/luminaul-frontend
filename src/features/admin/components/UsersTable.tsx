import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useResource } from "@/hooks/useResource";
import {
  Loading,
  Notice,
  Modal,
  ActionForm,
  Field,
} from "@/components/ui";
import { AdminUser } from "../types";

export function UsersTable() {
  const rows = useResource<AdminUser[]>("/admin/users", []),
    [search, setSearch] = useState(""),
    [selected, setSelected] = useState<AdminUser | null>(null),
    [reason, setReason] = useState("");

  return (
    <>
      <input
        className="search-bar"
        aria-label="Buscar usuario"
        placeholder="Buscar por nombre o correo"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Notice error>{rows.error}</Notice>
      {rows.loading ? (
        <Loading />
      ) : (
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
              {rows.data
                .filter((u) =>
                  `${u.name} ${u.email}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((u) => (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.name}</strong>
                      <small>{u.email}</small>
                    </td>
                    <td>
                      <span className="tag">
                        {u.status === "active"
                          ? "Activo"
                          : u.status === "suspended"
                            ? "Suspendido"
                            : "Pendiente de verificación"}
                      </span>
                    </td>
                    <td>
                      {u.role === "student" &&
                        ["active", "suspended"].includes(u.status) && (
                          <button
                            className="text-button"
                            onClick={() => {
                              setSelected(u);
                              setReason("");
                            }}
                          >
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
      )}
      {selected && (
        <Modal
          title={
            selected.status === "suspended"
              ? "Reactivar cuenta"
              : "Suspender cuenta"
          }
          close={() => setSelected(null)}
        >
          <p>{selected.name}</p>
          <ActionForm
            path={`/admin/users/${selected.id}/status`}
            payload={() => ({
              suspended: selected.status !== "suspended",
              reason,
            })}
            label="Confirmar decisión"
            done={() => {
              setSelected(null);
              rows.reload();
            }}
          >
            <Field label="Motivo">
              <textarea
                required
                minLength={5}
                maxLength={1000}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </Field>
          </ActionForm>
        </Modal>
      )}
    </>
  );
}
