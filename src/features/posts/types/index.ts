export interface Course {
  id: string;
  name: string;
  cycle: number;
}

export interface Publication {
  id: string;
  user_id?: string;
  group_id?: string | null;
  course_id?: string;
  type: "study_group" | "tutoring";
  description: string;
  status: string;
  created_at: string;
  author_name?: string;
  course_name?: string;
  cycle?: number;
  group_name?: string;
  benefits?: string;
  requirements?: string;
  max_capacity?: number;
  photo_url?: string;
  author?: {
    user_id: string;
    name: string;
    profile_photo_url: string | null;
  };
  course?: {
    id: string;
    name: string;
    cycle: number;
  };
}

export interface CreatePostPayload {
  type: "study_group" | "tutoring";
  course_id: string;
  group_id?: string;
  description: string;
  benefits?: string;
  requirements?: string;
  max_capacity?: number;
}

export interface UpdatePostPayload {
  type?: "study_group" | "tutoring";
  course_id?: string;
  description?: string;
  benefits?: string;
  requirements?: string;
  max_capacity?: number;
}
