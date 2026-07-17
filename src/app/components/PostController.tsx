
import {
  create,
  getPosts,
  type PostPayload,
  type PostResponse,
  type PostFilters,
  type PostFeedResponse,
} from './PostService';

interface CreatePostFormData {
  postType: string;
  course: string; // course_id (uuid)
  description: string;
}


const POST_TYPE_TO_API: Record<string, PostPayload['type']> = {
  asesoria: 'tutoring',
  grupo: 'study_group',
};


// CreatePostForm.tsx -> PostController.tsx -> PostService.tsx
export async function createPost(data: CreatePostFormData): Promise<PostResponse> {
  const payload: PostPayload = {
    course_id: data.course,
    type: POST_TYPE_TO_API[data.postType],
    description: data.description.trim(),
  };

  return create(payload);
}


// SearchPage.tsx -> PostController.tsx (filterFeed) -> PostService.tsx (getPosts)
// Trae el feed filtrado (HU 1.3 / 1.5). Los filtros type/course_id/cycle viajan
// al servidor; devuelve los posts con autor y curso anidados.
export function filterFeed(filters: PostFilters = {}): Promise<PostFeedResponse[]> {
  return getPosts(filters);
}
