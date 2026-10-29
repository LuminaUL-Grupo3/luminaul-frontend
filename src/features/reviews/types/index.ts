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
