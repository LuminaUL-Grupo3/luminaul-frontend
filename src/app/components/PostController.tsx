
import { create, type PostPayload, type PostResponse } from './PostService';

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
