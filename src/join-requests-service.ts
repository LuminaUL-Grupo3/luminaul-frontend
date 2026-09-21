import {
  api,
  JoinRequestListResponse,
  RespondJoinRequestResponse,
  JoinRequestAction,
} from "./api";

/**
 * Servicio para la gestión de solicitudes de unión a grupos de estudio (H.U. 2.2).
 * Consume los endpoints ratificados en el Acuerdo de Endpoints:
 * - GET /join-requests/me
 * - PATCH /join-requests/:requestId
 */
export const joinRequestsService = {
  /**
   * Obtiene la lista de solicitudes pendientes enviadas a los grupos donde el usuario autenticado es administrador.
   * Endpoint: GET /join-requests/me
   */
  async getMyJoinRequests(): Promise<JoinRequestListResponse> {
    return api.request<JoinRequestListResponse>("/join-requests/me", "GET");
  },

  /**
   * Acepta o rechaza una solicitud de unión pendiente.
   * Endpoint: PATCH /join-requests/:requestId
   * @param requestId Identificador UUID de la solicitud
   * @param action Acción a tomar: 'accepted' para admitir al miembro o 'rejected' para rechazar
   */
  async respondToJoinRequest(
    requestId: string,
    action: JoinRequestAction,
  ): Promise<RespondJoinRequestResponse> {
    return api.request<RespondJoinRequestResponse>(
      `/join-requests/${requestId}`,
      "PATCH",
      { action },
    );
  },
};
