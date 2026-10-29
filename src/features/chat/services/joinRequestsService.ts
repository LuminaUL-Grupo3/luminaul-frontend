import { api } from "../../../config/api";
import {
  JoinRequestListResponse,
  RespondJoinRequestResponse,
  JoinRequestAction,
} from "../types";

export const joinRequestsService = {
  async getMyJoinRequests(): Promise<JoinRequestListResponse> {
    return api.request<JoinRequestListResponse>("/join-requests/me", "GET");
  },

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
