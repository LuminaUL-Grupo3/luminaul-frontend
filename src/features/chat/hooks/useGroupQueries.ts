import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useSession } from "@/features/auth";
import { messagingService } from "../services/messagingService";
import type { CreateGroupRequest, GroupFilter } from "../types/contracts";

export const groupKeys = {
  root: ["spec04"] as const,
  mine: (userId: string) => ["spec04", "mine", userId] as const,
  detail: (userId: string, groupId: string) =>
    ["spec04", "detail", userId, groupId] as const,
  members: (userId: string, groupId: string) =>
    ["spec04", "members", userId, groupId] as const,
  messages: (userId: string, groupId: string) =>
    ["spec04", "messages", userId, groupId] as const,
};
/** La cuenta forma parte de la clave para no reutilizar datos privados de otra sesión. */
export function useMyGroupsQuery() {
  const { user } = useSession();
  return useQuery({
    queryKey: groupKeys.mine(user?.id || ""),
    queryFn: messagingService.mine,
    enabled: Boolean(user),
    staleTime: 15_000,
  });
}
/** Mantiene filtros en la clave y pagina el directorio en bloques pequeños. */
export function useGroupsDirectoryQuery(filter: GroupFilter) {
  return useInfiniteQuery({
    queryKey: ["spec04", "directory", filter],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      messagingService.directory({ ...filter, offset: pageParam, limit: 24 }),
    getNextPageParam: (page, pages) =>
      page.length === 24 ? pages.length * 24 : undefined,
  });
}
/** Consulta el grupo real y conserva los errores de carga para mostrarlos en la página. */
export function useGroupDetailQuery(groupId: string) {
  const { user } = useSession();
  return useQuery({
    queryKey: groupKeys.detail(user?.id || "", groupId),
    queryFn: () => messagingService.detail(groupId),
    enabled: Boolean(groupId),
    retry: false,
  });
}
/** Carga participantes solo después de confirmar una pertenencia activa. */
export function useGroupMembersQuery(groupId: string, enabled: boolean) {
  const { user } = useSession();
  return useQuery({
    queryKey: groupKeys.members(user?.id || "", groupId),
    queryFn: () => messagingService.members(groupId),
    enabled: enabled && Boolean(user),
    retry: false,
  });
}
/** Usa la consulta única de solicitudes pendientes que comparten los grupos del líder. */
export function useJoinRequestsQuery() {
  const { user } = useSession();
  return useQuery({
    queryKey: ["spec04", "requests", user?.id],
    queryFn: messagingService.requests,
    enabled: Boolean(user),
    retry: false,
  });
}
/** Solo confirma la creación tras persistir grupo y líder en el servidor. */
export function useCreateGroupMutation() {
  const cache = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGroupRequest) => messagingService.create(data),
    onSuccess: () => cache.invalidateQueries({ queryKey: groupKeys.root }),
  });
}
/** Reconstruye el historial por REST sin depender de que la conexión Socket.IO sea continua. */
export function useChatMessagesQuery(groupId: string, enabled: boolean) {
  const { user } = useSession();
  return useInfiniteQuery({
    queryKey: groupKeys.messages(user?.id || "", groupId),
    enabled: enabled && Boolean(groupId),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) => messagingService.history(groupId, pageParam),
    getNextPageParam: (page) => (page.length === 50 ? page[0]?.id : undefined),
    retry: false,
  });
}
