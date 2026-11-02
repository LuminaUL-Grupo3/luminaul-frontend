import { useQuery } from "@tanstack/react-query";
import { reviewsApiService } from "../services/ReviewsApiService";
import { UserReviewsSummaryDto } from "../types";

// Llaves de caché de TanStack Query. Todas empiezan con "reviews" para invalidarlas juntas.
export const reviewsQueryKeys = {
  all: ["reviews"] as const,
  me: ["reviews", "me"] as const,
  user: (userId: string) => ["reviews", "user", userId] as const,
  eligibility: (userId: string) => ["reviews", "eligibility", userId] as const,
};

// Resumen vacío mientras llega la respuesta
export const emptyReviewsSummary = (userId: string): UserReviewsSummaryDto => ({
  userId,
  averageRating: 0,
  totalReviews: 0,
  reviews: [],
});

// Promedio y reseñas de un perfil, propio o ajeno (HU 5.2)
export function useUserReviewsQuery(userId: string) {
  return useQuery({
    queryKey: reviewsQueryKeys.user(userId),
    queryFn: () => reviewsApiService.getUserReviews(userId),
    enabled: Boolean(userId),
    retry: false,
  });
}

// "Reseñas que escribí" (GET /reviews/me)
export function useMyReviewsQuery() {
  return useQuery({
    queryKey: reviewsQueryKeys.me,
    queryFn: () => reviewsApiService.getMyReviews(),
    retry: false,
  });
}

// ¿Se muestra el botón "Publicar reseña"? (HU 5.1). En el perfil propio no se consulta.
export function useReviewEligibilityQuery(userId: string, enabled = true) {
  return useQuery({
    queryKey: reviewsQueryKeys.eligibility(userId),
    queryFn: () => reviewsApiService.checkEligibility(userId),
    enabled: enabled && Boolean(userId),
    retry: false,
  });
}
