import { api } from "./apiClient";
import type {
  ActionResponse,
  CreateGroupRequest,
  GroupDetailDto,
  GroupFilter,
  GroupMemberDto,
  GroupMessageDto,
  JoinRequestDto,
  JoinResponse,
} from "../types/contracts";

/** Repositorio HTTP del feature: todas las peticiones reutilizan el cliente de sesión del equipo. */
export const messagingService = {
  /** Consulta el directorio con filtros independientes de las publicaciones. */
  directory(filter: GroupFilter = {}): Promise<GroupDetailDto[]> {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(filter))
      if (value !== undefined && value !== "") query.set(key, String(value));
    return api.request(`/groups?${query}`);
  },
  /** Carga grupos activos y sus contadores de mensajes pendientes. */
  mine(): Promise<GroupDetailDto[]> {
    return api.request("/groups/me?limit=100");
  },
  /** Recupera el detalle real, sin crear un grupo ficticio ante errores. */
  detail(id: string): Promise<GroupDetailDto> {
    return api.request(`/groups/${id}`);
  },
  /** El backend asigna el liderazgo al usuario autenticado. */
  create(data: CreateGroupRequest): Promise<GroupDetailDto> {
    return api.request("/groups", "POST", data);
  },
  /** Lista participantes activos solo si la cuenta pertenece al grupo. */
  members(id: string): Promise<GroupMemberDto[]> {
    return api.request(`/groups/${id}/members`);
  },
  /** Solicita ingreso con una presentación opcional de hasta 255 caracteres. */
  join(id: string, message: string): Promise<JoinResponse> {
    return api.request(`/groups/${id}/join-requests`, "POST", { message });
  },
  /** Consolida solicitudes de los grupos liderados por esta cuenta. */
  requests(): Promise<JoinRequestDto[]> {
    return api.request("/groups/pending-requests");
  },
  /** Resuelve una solicitud sin mezclar identificadores de dos grupos. */
  decide(
    groupId: string,
    id: string,
    status: "approved" | "rejected",
  ): Promise<ActionResponse> {
    return api.request(`/groups/${groupId}/join-requests/${id}`, "PATCH", {
      status,
    });
  },
  /** Conserva el historial de pertenencia al abandonar el grupo. */
  leave(id: string): Promise<ActionResponse> {
    return api.request(`/groups/${id}/members/me`, "DELETE");
  },
  /** Expulsa un integrante con autorización del líder. */
  kick(groupId: string, userId: string): Promise<ActionResponse> {
    return api.request(`/groups/${groupId}/members/${userId}`, "DELETE");
  },
  /** Transfiere liderazgo a otro integrante activo. */
  transfer(groupId: string, userId: string): Promise<ActionResponse> {
    return api.request(`/groups/${groupId}/leader`, "PATCH", { userId });
  },
  /** El cursor evita saltos al seguir recibiendo mensajes nuevos. */
  history(groupId: string, beforeId?: string): Promise<GroupMessageDto[]> {
    return api.request(
      `/groups/${groupId}/messages?limit=50${beforeId ? `&beforeId=${encodeURIComponent(beforeId)}` : ""}`,
    );
  },
};
