import { useState } from "react";
import { Plus } from "lucide-react";
import { useFeedback } from "@/hooks/useFeedback";
import { PageHeader, Loading, Notice } from "@/components/ui";
import {
  useDeleteAvailabilityMutation,
  useMyProfileQuery,
} from "../hooks/useProfileQueries";
import { AvailabilitySlotDto, DAYS_OF_WEEK } from "../types";
import { AvailabilityModal, AvailabilitySchedule } from "../components";

export function AvailabilityPage() {
  const feedback = useFeedback();
  const profile = useMyProfileQuery(),
    deleteSlot = useDeleteAvailabilityMutation(),
    [edit, setEdit] = useState<AvailabilitySlotDto | null>(null),
    [open, setOpen] = useState(false),
    [error, setError] = useState("");

  async function remove(slot: AvailabilitySlotDto) {
    const day = DAYS_OF_WEEK.find((d) => d.value === slot.dayOfWeek)?.label;
    if (
      !(await feedback.confirm({
        title: "¿Eliminar esta franja?",
        description: `${day}, de ${slot.startTime} a ${slot.endTime}. Dejará de aparecer en tu horario disponible.`,
        acceptLabel: "Eliminar franja",
      }))
    )
      return;
    try {
      const result = await deleteSlot.mutateAsync(slot.id);
      setError("");
      feedback.notify(result.message);
    } catch (e) {
      setError((e as Error).message);
    }
  }

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
      <Notice error>{profile.error?.message || error}</Notice>
      {profile.isLoading ? (
        <Loading />
      ) : (
        profile.data && (
          <AvailabilitySchedule
            availability={profile.data.availabilities}
            own
            onEdit={(slot) => {
              setEdit(slot);
              setOpen(true);
            }}
            onDelete={remove}
          />
        )
      )}
      {open && (
        <AvailabilityModal
          edit={edit}
          close={() => setOpen(false)}
          done={() => setOpen(false)}
        />
      )}
    </>
  );
}
