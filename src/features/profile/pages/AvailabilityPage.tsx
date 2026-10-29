import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { api, days } from "@/config/api";
import { useFeedback } from "@/hooks/useFeedback";
import { useResource } from "@/hooks/useResource";
import { PageHeader, Loading, Notice } from "@/components/ui";
import { Profile, Availability } from "../types";
import { AvailabilityModal } from "../components";

export function AvailabilityPage() {
  const feedback = useFeedback();
  const resource = useResource<Profile | null>("/profiles/me", null),
    [edit, setEdit] = useState<Availability | null>(null),
    [open, setOpen] = useState(false),
    [error, setError] = useState("");

  return (
    <>
      <PageHeader
        eyebrow="HAGAMOS TIEMPO PARA APRENDER"
        title="Mi horario disponible"
        description="Comparte tus horas libres. Nadie puede modificar tu horario."
        action={
          <button
            className="button"
            onClick={() => {
              setEdit(null);
              setOpen(true);
            }}
          >
            <Plus size={18} />
            Agregar franja
          </button>
        }
      />
      <Notice error>{resource.error || error}</Notice>
      {resource.loading ? (
        <Loading />
      ) : (
        <div className="week-grid">
          {days.map((d, i) => {
            const availability = resource.data?.availability || [];
            return (
              <section className="day-card" key={d}>
                <h3>{d}</h3>
                {availability
                  .filter((a) => a.day_of_week === i + 1)
                  .map((a) => (
                    <div className="time-slot" key={a.id}>
                      <strong>
                        {a.start_time.slice(0, 5)} – {a.end_time.slice(0, 5)}
                      </strong>
                      <div>
                        <button
                          className="icon-button"
                          title="Editar franja"
                          onClick={() => {
                            setEdit(a);
                            setOpen(true);
                          }}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="icon-button danger"
                          title="Eliminar franja"
                          onClick={async () => {
                            if (
                              !(await feedback.confirm({
                                title: "¿Eliminar esta franja?",
                                description: `${d}, de ${a.start_time.slice(0, 5)} a ${a.end_time.slice(0, 5)}. Dejará de aparecer en tu horario disponible.`,
                                acceptLabel: "Eliminar franja",
                              }))
                            )
                              return;
                            try {
                              await api.request(
                                `/availability/${a.id}`,
                                "DELETE",
                              );
                              setError("");
                              feedback.notify("Franja eliminada correctamente");
                              resource.reload();
                            } catch (e) {
                              setError((e as Error).message);
                            }
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                {!availability.some(
                  (a) => a.day_of_week === i + 1,
                ) && <p className="muted">Sin franjas</p>}
              </section>
            );
          })}
        </div>
      )}
      {open && (
        <AvailabilityModal
          edit={edit}
          close={() => setOpen(false)}
          done={() => {
            setOpen(false);
            resource.reload();
          }}
        />
      )}
    </>
  );
}
