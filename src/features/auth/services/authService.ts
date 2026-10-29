import { api } from "../../../config/api";
import { User } from "../types";

export const authService = {
  async getMe(): Promise<User> {
    return api.request<User>("/auth/me");
  },

  async login(payload: { email: string; password: string }): Promise<User> {
    return api.request<User>("/auth/login", "POST", payload);
  },

  async register(payload: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ message: string }> {
    return api.request<{ message: string }>("/auth/register", "POST", payload);
  },

  async verify(payload: { email: string; code: string }): Promise<{ message: string }> {
    return api.request<{ message: string }>("/auth/verify", "POST", payload);
  },

  async recoverPassword(payload: { email: string }): Promise<{ message: string }> {
    return api.request<{ message: string }>("/auth/recover", "POST", payload);
  },

  async resetPassword(payload: {
    email: string;
    code?: string;
    password: string;
  }): Promise<{ message: string }> {
    return api.request<{ message: string }>("/auth/reset", "POST", payload);
  },

  async logout(): Promise<void> {
    try {
      await api.request("/auth/logout", "POST");
    } catch (e) {
      if ((e as { status?: number }).status !== 401) throw e;
    }
  },
};
