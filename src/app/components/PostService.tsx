import { env } from '../../config/env';

const API_BASE_URL = env.apiUrl;

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


// ----- Feed / Búsqueda y filtros (HU 1.3 / 1.5) -----

export type PostType = 'tutoring' | 'study_group';

export interface PostAuthor {
  user_id: string;
  name: string;
  profile_photo_url: string | null;
}

export interface PostCourse {
  id: string;
  name: string;
  cycle: number;
}

// Post tal como llega en el feed (autor y curso anidados): GET /api/v1/posts.
export interface PostFeedResponse {
  id: string;
  type: PostType;
  description: string;
  group_id: string | null;
  status: string;
  created_at: string;
  author: PostAuthor;
  course: PostCourse;
}

export interface PostFilters {
  course_id?: string;
  type?: PostType;
  cycle?: number;
  limit?: number;
  offset?: number;
}


// PostController.tsx (filterFeed) -> PostService.tsx (getPosts) -> GET /api/v1/posts
export async function getPosts(filters: PostFilters = {}): Promise<PostFeedResponse[]> {
  const params = new URLSearchParams();
  if (filters.type) params.set('type', filters.type);
  if (filters.course_id) params.set('course_id', filters.course_id);
  if (filters.cycle != null) params.set('cycle', String(filters.cycle));
  params.set('limit', String(filters.limit ?? 15));
  params.set('offset', String(filters.offset ?? 0));

  const response = await fetch(`${API_BASE_URL}/posts?${params.toString()}`);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(
      typeof errorBody?.detail === 'string'
        ? errorBody.detail
        : 'No se pudieron cargar las publicaciones. Intenta nuevamente.'
    );
  }

  return response.json();
}
