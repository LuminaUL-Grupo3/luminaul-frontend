import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService, notificationsService, UsersFilter } from "../services/adminService";
import {
  AdminAppealStatus,
  AdminReportStatus,
  ChangeUserStatusRequest,
  ResolveAppealRequest,
  ResolveReportRequest,
} from "../types";

const ADMIN_KEY = "admin";
const NOTIFICATIONS_KEY = "notifications";

// Cualquier decisión del administrador cambia reportes, apelaciones, usuarios y métricas
function useInvalidateAdmin() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [ADMIN_KEY] });
}

export function useAdminReportsQuery(status?: AdminReportStatus) {
  return useQuery({
    queryKey: [ADMIN_KEY, "reports", status ?? "all"],
    queryFn: () => adminService.getReports(status),
    retry: false,
  });
}

export function useResolveReportMutation() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ResolveReportRequest }) =>
      adminService.resolveReport(id, payload),
    onSuccess: invalidate,
  });
}

export function useAdminAppealsQuery(status?: AdminAppealStatus) {
  return useQuery({
    queryKey: [ADMIN_KEY, "appeals", status ?? "all"],
    queryFn: () => adminService.getAppeals(status),
    retry: false,
  });
}

export function useResolveAppealMutation() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ResolveAppealRequest }) =>
      adminService.resolveAppeal(id, payload),
    onSuccess: invalidate,
  });
}

export function useAdminUsersQuery(filter: UsersFilter) {
  return useQuery({
    queryKey: [ADMIN_KEY, "users", filter.search ?? "", filter.status ?? ""],
    queryFn: () => adminService.getUsers(filter),
    retry: false,
  });
}

export function useChangeUserStatusMutation() {
  const invalidate = useInvalidateAdmin();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ChangeUserStatusRequest }) =>
      adminService.changeUserStatus(id, payload),
    onSuccess: invalidate,
  });
}

export function useAdminStatsQuery() {
  return useQuery({
    queryKey: [ADMIN_KEY, "stats"],
    queryFn: adminService.getStats,
    retry: false,
  });
}

export function useMyNotificationsQuery() {
  return useQuery({
    queryKey: [NOTIFICATIONS_KEY, "me"],
    queryFn: notificationsService.getMine,
    retry: false,
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsService.markRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] }),
  });
}
