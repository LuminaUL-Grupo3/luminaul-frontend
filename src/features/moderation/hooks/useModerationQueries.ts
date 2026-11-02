import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { moderationService } from "../services/moderationService";
import { CreateAppealRequest, CreateReportRequest } from "../types";

// Todas las llaves empiezan con "moderation" para invalidarlas juntas
export const moderationQueryKeys = {
  all: ["moderation"] as const,
  myLogs: ["moderation", "my-logs"] as const,
  myReports: ["moderation", "reports", "me"] as const,
};

// GET /moderation/my-logs (HU 6.3)
export function useMyModerationLogsQuery() {
  return useQuery({
    queryKey: moderationQueryKeys.myLogs,
    queryFn: moderationService.getMyModerationLogs,
    retry: false,
  });
}

// GET /moderation/reports/me
export function useMyReportsQuery() {
  return useQuery({
    queryKey: moderationQueryKeys.myReports,
    queryFn: moderationService.getMyReports,
    retry: false,
  });
}

// POST /moderation/reports (HU 6.1)
export function useCreateReportMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReportRequest) => moderationService.createReport(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: moderationQueryKeys.myReports }),
  });
}

// POST /moderation/appeals (HU 6.4)
export function useCreateAppealMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAppealRequest) => moderationService.createAppeal(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: moderationQueryKeys.myLogs }),
  });
}
