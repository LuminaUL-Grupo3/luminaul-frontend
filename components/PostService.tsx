
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

export interface PostPayload {
  course_id: string;
  type: 'tutoring' | 'study_group';
  description: string;
}

export interface PostResponse {
  id: string;
  course_id: string;
  type: string;
  description: string;
  [key: string]: unknown;
}


// PostService.tsx -> PostController.py
export async function create(post: PostPayload): Promise<PostResponse> {
  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      typeof errorBody?.detail === 'string'
        ? errorBody.detail
        : 'No se pudo crear la publicación. Intenta nuevamente.'
    );
  }

  return response.json();
}
