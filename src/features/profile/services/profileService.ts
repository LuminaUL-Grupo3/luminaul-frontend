import { api } from "../../../config/api";
import {
  AvailabilityActionResponse,
  CreateAvailabilityRequest,
  DeleteAvailabilityResponse,
  StudentProfileDto,
  UpdateAvailabilityRequest,
  UpdateProfileRequest,
} from "../types";

export const profileService = {
  getMyProfile(): Promise<StudentProfileDto> {
    return api.request<StudentProfileDto>("/profiles/me");
  },

  getProfile(userId: string): Promise<StudentProfileDto> {
    return api.request<StudentProfileDto>(`/profiles/${userId}`);
  },

  updateMyProfile(payload: UpdateProfileRequest): Promise<StudentProfileDto> {
    return api.request<StudentProfileDto>("/profiles/me", "PUT", payload);
  },

  createAvailability(
    payload: CreateAvailabilityRequest,
  ): Promise<AvailabilityActionResponse> {
    return api.request<AvailabilityActionResponse>(
      "/profiles/me/availability",
      "POST",
      payload,
    );
  },

  updateAvailability(
    id: string,
    payload: UpdateAvailabilityRequest,
  ): Promise<AvailabilityActionResponse> {
    return api.request<AvailabilityActionResponse>(
      `/profiles/me/availability/${id}`,
      "PUT",
      payload,
    );
  },

  deleteAvailability(id: string): Promise<DeleteAvailabilityResponse> {
    return api.request<DeleteAvailabilityResponse>(
      `/profiles/me/availability/${id}`,
      "DELETE",
    );
  },
};
