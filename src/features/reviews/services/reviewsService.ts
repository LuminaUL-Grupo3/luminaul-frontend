import { api } from "../../../config/api";
import { Review, ReviewEligibility } from "../types";

export const reviewsService = {
  async getMyReviews(): Promise<Review[]> {
    return api.request<Review[]>("/reviews/me");
  },

  async getUserReviews(userId: string): Promise<Review[]> {
    return api.request<Review[]>(`/profiles/${userId}/reviews`);
  },

  async checkEligibility(userId: string): Promise<ReviewEligibility> {
    return api.request<ReviewEligibility>(`/profiles/${userId}/review-eligibility`);
  },

  async createReview(payload: {
    reviewed_user_id: string;
    rating: number;
    comment: string;
  }): Promise<{ message: string }> {
    return api.request<{ message: string }>("/reviews", "POST", payload);
  },

  async updateReview(
    id: string,
    payload: { rating: number; comment: string },
  ): Promise<{ message: string }> {
    return api.request<{ message: string }>(`/reviews/${id}`, "PUT", payload);
  },

  async deleteReview(id: string): Promise<{ message: string }> {
    return api.request<{ message: string }>(`/reviews/${id}`, "DELETE");
  },
};
