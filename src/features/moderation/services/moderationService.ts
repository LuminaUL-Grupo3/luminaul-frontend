import { api } from "@/config/api";
import {
  CreateAppealRequest,
  CreateAppealResponse,
  CreateReportRequest,
  CreateReportResponse,
  ModerationLogDto,
  ReportDto,
} from "../types";

export const moderationService = {
  // HU 6.1
  createReport(payload: CreateReportRequest): Promise<CreateReportResponse> {
    return api.request("/moderation/reports", "POST", payload);
  },

  getMyReports(): Promise<ReportDto[]> {
    return api.request("/moderation/reports/me");
  },

  // HU 6.3
  getMyModerationLogs(): Promise<ModerationLogDto[]> {
    return api.request("/moderation/my-logs");
  },

  // HU 6.4
  createAppeal(payload: CreateAppealRequest): Promise<CreateAppealResponse> {
    return api.request("/moderation/appeals", "POST", payload);
  },
};
