import { useState, useEffect, useCallback } from "react";
import { JoinRequestItem, JoinRequestAction } from "./api";
import { joinRequestsService } from "./join-requests-service";
import { useFeedback } from "./feedback";

/**
 * Hook con la lógica de negocio para la gestión de solicitudes de unión (H.U. 2.2).
 * Maneja los estados de carga, lista, errores, procesamiento individual y actualización
 * sin recargar la página tras aceptar o rechazar solicitudes.
 */
export function useJoinRequests() {
  const feedback = useFeedback();
  const [requests, setRequests] = useState<JoinRequestItem[]>([]);
  const [total, setTotal] = useState(0);
  const [emptyMessage, setEmptyMessage] = useState(
    "No hay solicitudes pendientes por revisar",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    setActionError("");
    try {
      const response = await joinRequestsService.getMyJoinRequests();
      const list = response.requests || [];
      setRequests(list);
      setTotal(response.total ?? list.length);
      if (response.message) {
        setEmptyMessage(response.message);
      }
    } catch (err) {
      setError((err as Error).message || "No se pudieron cargar las solicitudes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleDecision = async (
    requestId: string,
    action: JoinRequestAction,
  ) => {
    if (processingId) return;
    setProcessingId(requestId);
    setActionError("");

    try {
      const result = await joinRequestsService.respondToJoinRequest(
        requestId,
        action,
      );

      // Criterios 1 y 2: Se remueve la solicitud de la lista tras resolverse
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      setTotal((prev) => Math.max(0, prev - 1));

      const defaultMsg =
        action === "accepted"
          ? "Solicitud aceptada exitosamente"
          : "Solicitud rechazada exitosamente";
      feedback.notify(result.message || defaultMsg);
    } catch (err) {
      const msg =
        (err as Error).message || "Ocurrió un error al responder la solicitud";
      setActionError(msg);
      feedback.notify(msg);
    } finally {
      setProcessingId(null);
    }
  };

  const acceptRequest = (requestId: string) =>
    handleDecision(requestId, "accepted");

  const rejectRequest = (requestId: string) =>
    handleDecision(requestId, "rejected");

  return {
    requests,
    total,
    emptyMessage,
    loading,
    error,
    actionError,
    processingId,
    acceptRequest,
    rejectRequest,
    reload: loadRequests,
  };
}
