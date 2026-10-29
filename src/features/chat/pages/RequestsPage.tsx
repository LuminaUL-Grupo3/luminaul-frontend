import { PageHeader, Loading, Notice, Empty } from "@/components/ui";
import { useJoinRequests } from "../hooks/useJoinRequests";
import { JoinRequestCard } from "../components";

export function RequestsPage() {
  const {
    requests,
    emptyMessage,
    loading,
    error,
    actionError,
    processingId,
    acceptRequest,
    rejectRequest,
  } = useJoinRequests();

  return (
    <>
      <PageHeader
        eyebrow="GESTIONAR COMUNIDAD"
        title="Solicitudes de ingreso"
        description="Revisa quién quiere unirse a los grupos que administras."
      />
      <Notice error>{error || actionError}</Notice>
      {loading ? (
        <Loading />
      ) : requests.length > 0 ? (
        <div className="stack">
          {requests.map((r) => (
            <JoinRequestCard
              key={r.id}
              request={r}
              onAccept={acceptRequest}
              onReject={rejectRequest}
              isProcessing={processingId === r.id}
            />
          ))}
        </div>
      ) : (
        <Empty title="No hay solicitudes pendientes por revisar">
          {emptyMessage || "Las nuevas solicitudes aparecerán aquí."}
        </Empty>
      )}
    </>
  );
}
