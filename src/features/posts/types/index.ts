export type PostType = "study_group" | "tutoring";
export type PostStatus = "published" | "hidden" | "inactive";

export interface Course {
  id: string;
  name: string;
  cycle: number | null;
}

export interface PostAuthor {
  id: string;
  name: string;
  profilePhotoUrl?: string | null;
}

export interface Publication {
  color?: string;
  id: string;
  userId?: string;
  groupId?: string | null;
  courseId?: string;
  type: PostType;
  description: string;
  benefits?: string | null;
  requirements?: string | null;
  maxCapacity?: number;
  status: PostStatus | string;
  createdAt?: string;
  updatedAt?: string;
  author?: PostAuthor;
  course?: Course;
}

export interface PostFilterQuery {
  courseId?: string;
  type?: PostType;
  cycle?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreatePostPayload {
  type: PostType;
  courseId: string;
  groupId?: string;
  description: string;
  benefits?: string;
  requirements?: string;
  maxCapacity?: number;
}

export interface UpdatePostPayload {
  groupId?: string | null;
  description?: string;
  benefits?: string;
  requirements?: string;
  maxCapacity?: number;
}

export interface PaginatedPostsResponse {
  total: number;
  limit: number;
  offset: number;
  items: Publication[];
}
