export type PostType = "tutoring" | "study_group";
export type PostStatus = "published" | "hidden";

export interface Post {
  id: string; // UUID
  user_id: string; // UUID, no editable, viene del JWT en backend
  course_id: string; // UUID
  type: PostType;
  description: string;
  group_id: string | null; // obligatorio si type === "study_group", null si "tutoring"
  status: PostStatus;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

// Body que se envía en PUT /api/posts/:id
export interface PostUpdatePayload {
  course_id: string;
  type: PostType;
  description: string;
  group_id: string | null;
}

// Response de DELETE /api/posts/:id
export interface PostDeleteResponse {
  success: boolean;
  message: string;
  publication_id: string;
  deleted_at: string;
}
