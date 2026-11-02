import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsApiService } from "../services/ReviewsApiService";
import { CreateReviewRequest, UpdateReviewRequest } from "../types";
import { reviewsQueryKeys } from "./useReviewsQueries";

// Tras escribir, editar o borrar, cambian el promedio, la lista y la elegibilidad:
// se invalidan todas las consultas de reseñas y TanStack Query las vuelve a pedir.
function useInvalidateReviews() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: reviewsQueryKeys.all });
}

// POST /reviews
export function useCreateReviewMutation() {
  const invalidate = useInvalidateReviews();
  return useMutation({
    mutationFn: (payload: CreateReviewRequest) => reviewsApiService.createReview(payload),
    onSuccess: invalidate,
  });
}

// PUT /reviews/:reviewId
export function useUpdateReviewMutation() {
  const invalidate = useInvalidateReviews();
  return useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: string; payload: UpdateReviewRequest }) =>
      reviewsApiService.updateReview(reviewId, payload),
    onSuccess: invalidate,
  });
}

// DELETE /reviews/:reviewId
export function useDeleteReviewMutation() {
  const invalidate = useInvalidateReviews();
  return useMutation({
    mutationFn: (reviewId: string) => reviewsApiService.deleteReview(reviewId),
    onSuccess: invalidate,
  });
}
