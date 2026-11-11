// Contrato de SPEC-07 (Panel de Administración y Notificaciones)

export type AdminContentType = "publication" | "message" | "review";
export type AdminReportStatus = "pending" | "resolved" | "dismissed";
export type AdminAppealStatus = "pending" | "approved" | "rejected";
export type AdminAccountStatus =
  | "pending_verification"
  | "active"
  | "suspended"
  | "deleted";
export type NotificationType = "MODERATION" | "GROUP" | "SYSTEM";

export interface Paginated<T> {
  total: number;
  items: T[];
}

export interface AdminReportDetailDto {
  id: string;
  reason: string;
  status: AdminReportStatus;
  createdAt: string;
  resolvedAt: string | null;
  resolutionNotes: string | null;
  reporter: { id: string; email: string; name: string };
  target: {
    type: AdminContentType;
    id: string;
    authorId: string | null;
    authorName: string | null;
    authorStatus: AdminAccountStatus | null;
    content: string | null;
    currentStatus: string | null;
  };
}

export interface ResolveReportRequest {
  status: "resolved" | "dismissed";
  action?: "delete_content" | "none";
  notes?: string;
}

export interface ResolveReportResponse {
  message: string;
  reportId: string;
  status: "resolved" | "dismissed";
}

export interface AdminAppealDetailDto {
  id: string;
  moderationLogId: string;
  justification: string;
  status: AdminAppealStatus;
  createdAt: string;
  resolvedAt: string | null;
  user: { id: string; name: string; email: string };
  content: {
    type: AdminContentType;
    id: string;
    text: string | null;
    currentStatus: string | null;
    detectedWords: string[];
    moderatedAt: string;
  };
}

export interface ResolveAppealRequest {
  status: "approved" | "rejected";
}

export interface ResolveAppealResponse {
  message: string;
  appealId: string;
  status: "approved" | "rejected";
}

export interface AdminUserListItemDto {
  id: string;
  email: string;
  name: string;
  role: "student" | "admin";
  status: AdminAccountStatus;
  isVerified: boolean;
  suspensionReason: string | null;
  createdAt: string;
}

export interface ChangeUserStatusRequest {
  status: "active" | "suspended";
  reason: string;
}

export interface ChangeUserStatusResponse {
  message: string;
  userId: string;
  status: "active" | "suspended";
}

export interface AdminStatsDto {
  totalUsers: number;
  totalActiveGroups: number;
  totalPosts: number;
  pendingReports: number;
  pendingAppeals: number;
}

export interface NotificationDto {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface MarkNotificationReadResponse {
  message: string;
  id: string;
}

// Alias heredado: src/api.ts lo reexporta como Notice
export type NoticeNotification = NotificationDto;
