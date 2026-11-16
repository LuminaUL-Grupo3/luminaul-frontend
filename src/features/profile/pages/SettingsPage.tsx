import { useState } from "react";
import {
  useClearSession,
  useDeleteAccountMutation,
  useSession,
} from "@/features/auth";
import { useFeedback } from "@/hooks/useFeedback";
import { PageHeader, Notice, Field, ActionForm } from "@/components/ui";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { BellRing } from "lucide-react";
import "../styles/profile.css";

export function SettingsPage() {
  const feedback = useFeedback();
  const { user } = useSession(),
    clearSession = useClearSession(),
    deleteAccount = useDeleteAccountMutation(),
    [current, setCurrent] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState("");
  const { preferences, save } = useNotificationPreferences(user?.id ?? "");

  return (
    <>
      <PageHeader
        title="Configuración de cuenta"
        description="Tu seguridad y tus datos, bajo tu control."
      />
      <div className="narrow stack">
        {user && (
          <section className="panel notification-preferences">
          <h3>
            <BellRing size={19} /> Avisos en pantalla
          </h3>
          <p>
            La campana y el historial siempre reciben tus notificaciones. Elige
            cuáles aparecen mientras navegas.
          </p>
          <label className="notification-toggle">
            <input
              type="checkbox"
              checked={preferences.enabled}
              onChange={(event) =>
                save({ ...preferences, enabled: event.target.checked })
              }
            />{" "}
            Mostrar avisos emergentes
          </label>
          <Field label="Prioridad de los avisos">
            <select
              value={preferences.minimum}
              disabled={!preferences.enabled}
              onChange={(event) =>
                save({
                  ...preferences,
                  minimum: event.target.value as "normal" | "high" | "all",
                })
              }
            >
              <option value="normal">Grupos y moderación</option>
              <option value="high">Solo moderación</option>
              <option value="all">Todas las notificaciones</option>
            </select>
          </Field>
          <small>
            Se guarda para esta cuenta en este navegador. Los avisos de
            suspensión siempre se muestran.
          </small>
        </section>
        )}
        <section className="panel">
          <ActionForm
            title="Cambiar contraseña"
            path="/auth/password"
            method="PUT"
            payload={() => ({ currentPassword: current, password })}
            label="Actualizar contraseña"
            done={() => clearSession()}
          >
            <Field label="Contraseña actual">
              <input
                type="password"
                required
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </Field>
            <Field label="Nueva contraseña">
              <input
                type="password"
                minLength={10}
                maxLength={72}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
          </ActionForm>
        </section>
        <section className="panel danger-zone">
          <h3>Eliminar mi cuenta</h3>
          <p>
            Se desactivará tu acceso, se anonimizará tu perfil y se ocultarán
            tus publicaciones. Los mensajes y registros necesarios para la
            moderación se conservarán.
          </p>
          <Notice error>{error}</Notice>
          <button
            className="button danger-button"
            disabled={deleteAccount.isPending}
            onClick={async () => {
              if (
                !(await feedback.confirm({
                  title: "¿Eliminar tu cuenta?",
                  description:
                    "Se cerrará tu sesión, se anonimizará tu perfil y se ocultarán tus publicaciones. Los mensajes y registros de moderación se conservarán. Esta acción no se puede deshacer.",
                  acceptLabel: "Eliminar mi cuenta",
                  cancelLabel: "Conservar mi cuenta",
                }))
              )
                return;
              try {
                setError("");
                await deleteAccount.mutateAsync();
                feedback.notify("Tu cuenta ha sido eliminada");
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            {deleteAccount.isPending ? "Eliminando…" : "Eliminar cuenta"}
          </button>
        </section>
      </div>
    </>
  );
}
