// Contrato de SPEC-06 (moderación automática, reportes y apelaciones)

export type TargetContentType = "publication" | "message" | "review";
export type ReportStatus = "pending" | "resolved" | "dismissed";
export type ModerationResult = "flagged" | "blocked" | "approved";
export type AppealStatus = "pending" | "approved" | "rejected";

export interface CreateReportRequest {
  reason: string;
  targetType: TargetContentType;
  targetId: string;
}

export interface CreateReportResponse {
  message: string;
  reportId: string;
  status: ReportStatus;
}

export interface ReportDto {
  id: string;
  reporterId: string;
  targetType: TargetContentType;
  targetId: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
}

export interface CreateAppealRequest {
  moderationLogId: string;
  justification: string;
}

export interface CreateAppealResponse {
  message: string;
  appealId: string;
  status: AppealStatus;
}

export interface ModerationLogDto {
  id: string;
  contentType: TargetContentType;
  contentId: string;
  result: ModerationResult;
  detectedWords: string[];
  // null si el contenido se eliminó después de moderarse
  content: string | null;
  moderatedAt: string;
  appealStatus: AppealStatus | null;
  canAppeal: boolean;
}

// Mismos límites que los DTO del backend
export const MODERATION_LIMITS = {
  MAX_REASON_LENGTH: 255,
  MAX_JUSTIFICATION_LENGTH: 1000,
} as const;

export const CONTENT_TYPE_LABELS: Record<TargetContentType, string> = {
  publication: "Publicación",
  message: "Mensaje",
  review: "Reseña",
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pending: "En revisión",
  resolved: "Resuelto",
  dismissed: "Desestimado",
};

export const APPEAL_STATUS_LABELS: Record<AppealStatus, string> = {
  pending: "Apelación pendiente",
  approved: "Apelación aprobada",
  rejected: "Apelación rechazada",
};

// Motivos sugeridos para el selector del ReportModal
export const REPORT_REASONS = [
  "Lenguaje ofensivo o insultos",
  "Acoso o intimidación",
  "Spam o publicidad",
  "Fraude, plagio o venta de trabajos",
  "Contenido que no corresponde a la plataforma",
] as const;
