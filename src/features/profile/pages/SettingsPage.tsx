import { useState } from "react";
import { api } from "@/config/api";
import { useSession } from "@/features/auth";
import { useFeedback } from "@/hooks/useFeedback";
import { PageHeader, Notice, Field, ActionForm } from "@/components/ui";

export function SettingsPage() {
  const feedback = useFeedback();
  const { setUser } = useSession(),
    [current, setCurrent] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState("");

  return (
    <>
      <PageHeader
        title="Configuración de cuenta"
        description="Tu seguridad y tus datos, bajo tu control."
      />
      <div className="narrow stack">
        <section className="panel">
          <ActionForm
            title="Cambiar contraseña"
            path="/auth/password"
            method="PUT"
            payload={() => ({ current_password: current, password })}
            label="Actualizar contraseña"
            done={() => setUser(null)}
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
                maxLength={128}
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
                await api.request("/auth/account", "DELETE");
                feedback.notify("Tu cuenta ha sido eliminada");
                setUser(null);
              } catch (e) {
                setError((e as Error).message);
              }
            }}
          >
            Eliminar cuenta
          </button>
        </section>
      </div>
    </>
  );
}
