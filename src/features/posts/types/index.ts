export type PostType = "study_group" | "tutoring";
export type PostStatus = "published" | "hidden" | "inactive";

export interface Course {
  id: string;
  name: string;
  cycle: number | null;
}

export interface PostAuthor {
  id?: string;
  user_id?: string;
  name: string;
  profilePhotoUrl?: string | null;
  profile_photo_url?: string | null;
}

export interface Publication {
  id: string;
  userId?: string;
  user_id?: string;
  groupId?: string | null;
  group_id?: string | null;
  courseId?: string;
  course_id?: string;
  type: PostType;
  description: string;
  benefits?: string | null;
  requirements?: string | null;
  maxCapacity?: number;
  max_capacity?: number;
  status: PostStatus | string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  author_name?: string;
  course_name?: string;
  cycle?: number;
  group_name?: string;
  photo_url?: string;
  author?: PostAuthor;
  course?: Course;
}

export interface PostFilterQuery {
  courseId?: string;
  course_id?: string;
  type?: PostType;
  cycle?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreatePostPayload {
  type: PostType;
  courseId?: string;
  course_id?: string;
  groupId?: string;
  group_id?: string;
  description: string;
  benefits?: string;
  requirements?: string;
  maxCapacity?: number;
  max_capacity?: number;
}

export interface UpdatePostPayload {
  type?: PostType;
  courseId?: string;
  course_id?: string;
  description?: string;
  benefits?: string;
  requirements?: string;
  maxCapacity?: number;
  max_capacity?: number;
}

export interface PaginatedPostsResponse {
  total: number;
  limit: number;
  offset: number;
  items: Publication[];
}
