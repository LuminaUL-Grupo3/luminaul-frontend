import { api, ApiClient } from "@/config/api";
import {
  CreateReviewRequest,
  DeleteReviewResponse,
  ReviewDto,
  ReviewEligibilityResponse,
  UpdateReviewRequest,
  UserReviewsSummaryDto,
} from "../types";

// Llamadas HTTP de SPEC-05 (el "ApiService" del frontend). Recibe el cliente HTTP por
// constructor (D de SOLID): los componentes no saben de fetch ni de rutas.
export class ReviewsApiService {
  constructor(private readonly http: ApiClient = api) {}

  getUserReviews(userId: string): Promise<UserReviewsSummaryDto> {
    return this.http.request<UserReviewsSummaryDto>(`/reviews/user/${userId}`);
  }

  getMyReviews(): Promise<ReviewDto[]> {
    return this.http.request<ReviewDto[]>("/reviews/me");
  }

  checkEligibility(userId: string): Promise<ReviewEligibilityResponse> {
    return this.http.request<ReviewEligibilityResponse>(`/reviews/eligibility/${userId}`);
  }

  createReview(payload: CreateReviewRequest): Promise<ReviewDto> {
    return this.http.request<ReviewDto>("/reviews", "POST", payload);
  }

  updateReview(reviewId: string, payload: UpdateReviewRequest): Promise<ReviewDto> {
    return this.http.request<ReviewDto>(`/reviews/${reviewId}`, "PUT", payload);
  }

  deleteReview(reviewId: string): Promise<DeleteReviewResponse> {
    return this.http.request<DeleteReviewResponse>(`/reviews/${reviewId}`, "DELETE");
  }
}

// Singleton: una sola instancia compartida por todos los hooks, como `api` en config/api.ts
export const reviewsApiService = new ReviewsApiService();
