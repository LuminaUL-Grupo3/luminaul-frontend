import { api } from "../../../config/api";
import { Report, Appeal, AdminUser, Moderated, NoticeNotification } from "../types";

export const adminService = {
  async getReports(): Promise<Report[]> {
    return api.request<Report[]>("/admin/reports");
  },

  async getAppeals(): Promise<Appeal[]> {
    return api.request<Appeal[]>("/admin/appeals");
  },

  async getUsers(): Promise<AdminUser[]> {
    return api.request<AdminUser[]>("/admin/users");
  },

  async removeReportedPost(postId: string, reason: string): Promise<{ message: string }> {
    return api.request<{ message: string }>(`/admin/posts/${postId}/remove`, "POST", { reason });
  },

  async setUserStatus(userId: string, suspended: boolean, reason: string): Promise<{ message: string }> {
    return api.request<{ message: string }>(`/admin/users/${userId}/status`, "POST", {
      suspended,
      reason,
    });
  },

  async decideAppeal(appealId: string, approve: boolean, reason: string): Promise<{ message: string }> {
    return api.request<{ message: string }>(`/admin/appeals/${appealId}/decision`, "POST", {
      approve,
      reason,
    });
  },

  async getMyModerated(): Promise<Moderated[]> {
    return api.request<Moderated[]>("/moderation/me");
  },

  async submitAppeal(logId: string, justification: string): Promise<{ message: string }> {
    return api.request<{ message: string }>("/appeals", "POST", {
      moderation_log_id: logId,
      justification,
    });
  },

  async getNotifications(): Promise<NoticeNotification[]> {
    return api.request<NoticeNotification[]>("/notifications");
  },

  async markNotificationsRead(): Promise<void> {
    await api.request("/notifications/read", "POST");
  },
};
