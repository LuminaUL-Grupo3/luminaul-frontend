import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFeedback } from "@/hooks/useFeedback";
import { groupKeys } from "./useGroupQueries";
import { messagingService } from "../services/messagingService";
import type { JoinRequestDto } from "../types/contracts";

type Decision = "approved" | "rejected";
/** Coordina HU 2.2: una decisión en curso, confirmación real y actualización de las listas. */
export function useJoinRequestDecision(onConflict: () => void) {
  const cache = useQueryClient(),
    feedback = useFeedback();
  const locked = useRef(false);
  const [error, setError] = useState("");
  const mutation = useMutation({
    mutationFn: ({
      request,
      status,
    }: {
      request: JoinRequestDto;
      status: Decision;
    }) => messagingService.decide(request.groupId, request.id, status),
    onSuccess: (result, { request }) => {
      // Solo se retira la tarjeta después del HTTP exitoso; un fallo mantiene la solicitud visible.
      cache.setQueriesData<JoinRequestDto[]>(
        { queryKey: ["spec04", "requests"] },
        (previous) => previous?.filter((item) => item.id !== request.id),
      );
      feedback.notify(result.message);
      void cache.invalidateQueries({ queryKey: groupKeys.root });
    },
  });
  /** El ref evita dos peticiones incluso antes de que React pinte el estado pendiente. */
  async function decide(request: JoinRequestDto, status: Decision) {
    if (locked.current) return;
    locked.current = true;
    setError("");
    try {
      await mutation.mutateAsync({ request, status });
    } catch (cause) {
      setError((cause as Error).message);
      onConflict();
    } finally {
      locked.current = false;
    }
  }
  return {
    decide,
    error,
    pending: mutation.isPending,
    pendingId: mutation.isPending ? mutation.variables?.request.id : undefined,
    pendingStatus: mutation.variables?.status,
  };
}
