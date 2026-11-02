// Contrato compartido de SPEC-05 (mismos campos que los DTOs del backend)

export type ReviewStatus = "published" | "hidden" | "deleted";

export interface ReviewAuthorDto {
  id: string;
  name: string;
  profilePhotoUrl: string | null;
}

export interface ReviewDto {
  id: string; // UUID v4
  reviewerId: string;
  reviewedUserId: string;
  rating: number; // Entero de 1 a 5
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  reviewer: ReviewAuthorDto; // Autor
  reviewedUser: ReviewAuthorDto; // Estudiante calificado
}

export interface UserReviewsSummaryDto {
  userId: string;
  averageRating: number; // Promedio redondeado a 1 decimal
  totalReviews: number;
  reviews: ReviewDto[];
}

export interface CreateReviewRequest {
  reviewedUserId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

export interface ReviewEligibilityResponse {
  allowed: boolean;
  reason?: string;
}

export interface DeleteReviewResponse {
  message: string;
  deletedId: string;
}

// Límites que también valida el backend (CreateReviewDto / UpdateReviewDto)
export const REVIEW_LIMITS = {
  MIN_RATING: 1,
  MAX_RATING: 5,
  MAX_COMMENT_LENGTH: 1000,
} as const;

// Tipos que usa la sección de reseñas de ProfilePage (SPEC-02)
export interface Review {
  id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  rating: number;
  comment: string;
  author_name: string;
  target_name: string;
  created_at: string;
  status: string;
}

export interface ReviewEligibility {
  allowed: boolean;
  reason: string;
}
