import { api } from "../../../config/api";
import { Profile, Availability } from "../types";

export const profileService = {
  async getProfile(userId: string): Promise<Profile> {
    return api.request<Profile>(`/profiles/${userId}`);
  },

  async getMyProfile(): Promise<Profile> {
    return api.request<Profile>("/profiles/me");
  },

  async updateMyProfile(payload: Partial<Profile>): Promise<{ message: string }> {
    return api.request<{ message: string }>("/profiles/me", "PUT", payload);
  },

  async uploadPhoto(file: File): Promise<{ photo_url: string }> {
    const data = new FormData();
    data.append("photo", file);
    return api.request<{ photo_url: string }>("/profiles/me/photo", "POST", data);
  },

  async saveAvailability(
    payload: { day_of_week: number; start_time: string; end_time: string },
    id?: string,
  ): Promise<{ message: string }> {
    return api.request<{ message: string }>(
      id ? `/availability/${id}` : "/availability",
      id ? "PUT" : "POST",
      payload,
    );
  },

  async deleteAvailability(id: string): Promise<{ message: string }> {
    return api.request<{ message: string }>(`/availability/${id}`, "DELETE");
  },

  async deleteAccount(): Promise<{ message: string }> {
    return api.request<{ message: string }>("/auth/account", "DELETE");
  },
};
