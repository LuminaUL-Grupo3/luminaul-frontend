import { api } from "../../../config/api";
import {
  AdminAppealDetailDto,
  AdminAppealStatus,
  AdminReportDetailDto,
  AdminReportStatus,
  AdminStatsDto,
  AdminUserListItemDto,
  ChangeUserStatusRequest,
  ChangeUserStatusResponse,
  MarkNotificationReadResponse,
  NotificationDto,
  Paginated,
  ResolveAppealRequest,
  ResolveAppealResponse,
  ResolveReportRequest,
  ResolveReportResponse,
} from "../types";

// Arma el query string omitiendo los filtros vacíos
function withQuery(path: string, params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") query.set(key, String(value));
  });
  const text = query.toString();
  return text ? `${path}?${text}` : path;
}

export interface UsersFilter {
  search?: string;
  status?: string;
}

export const adminService = {
  getReports(status?: AdminReportStatus): Promise<Paginated<AdminReportDetailDto>> {
    return api.request(withQuery("/admin/reports", { status, limit: 100 }));
  },

  resolveReport(reportId: string, payload: ResolveReportRequest): Promise<ResolveReportResponse> {
    return api.request(`/admin/reports/${reportId}`, "PATCH", payload);
  },

  getAppeals(status?: AdminAppealStatus): Promise<Paginated<AdminAppealDetailDto>> {
    return api.request(withQuery("/admin/appeals", { status, limit: 100 }));
  },

  resolveAppeal(appealId: string, payload: ResolveAppealRequest): Promise<ResolveAppealResponse> {
    return api.request(`/admin/appeals/${appealId}`, "PATCH", payload);
  },

  getUsers(filter: UsersFilter): Promise<Paginated<AdminUserListItemDto>> {
    return api.request(withQuery("/admin/users", { ...filter, limit: 100 }));
  },

  changeUserStatus(
    userId: string,
    payload: ChangeUserStatusRequest,
  ): Promise<ChangeUserStatusResponse> {
    return api.request(`/admin/users/${userId}/status`, "PATCH", payload);
  },

  getStats(): Promise<AdminStatsDto> {
    return api.request("/admin/stats");
  },
};

export const notificationsService = {
  getMine(): Promise<NotificationDto[]> {
    return api.request("/notifications/me");
  },

  markRead(id: string): Promise<MarkNotificationReadResponse> {
    return api.request(`/notifications/${id}/read`, "PATCH");
  },
};
