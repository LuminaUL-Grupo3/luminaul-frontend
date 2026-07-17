
import {
  create,
  getPosts,
  getById,
  update,
  remove,
  type PostPayload,
  type PostResponse,
  type PostFilters,
  type PostFeedResponse,
} from './PostService';
import type {
  Post,
  PostUpdatePayload,
  PostDeleteResponse,
} from '../../types/post';

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


// ----- Edición y eliminación (HU 1.2 / 1.4) -----

interface EditPostFormData {
  postType: string; // 'asesoria' | 'grupo'
  course: string;   // course_id (uuid)
  description: string;
}

const API_TO_POST_TYPE: Record<string, string> = {
  tutoring: 'asesoria',
  study_group: 'grupo',
};

// Traduce el type de la API al value que usan los <select> del formulario.
export function apiTypeToFormType(type: string): string {
  return API_TO_POST_TYPE[type] ?? '';
}


// EditPostPage.tsx -> PostController.tsx (loadPostForEdit) -> PostService.tsx (getById)
export async function loadPostForEdit(id: string): Promise<Post> {
  if (!id) {
    throw new Error('Identificador de publicación inválido.');
  }

  return getById(id);
}


// EditPostPage.tsx -> PostController.tsx (savePost) -> PostService.tsx (update)
// Valida las reglas de negocio antes de tocar la red.
export async function savePost(id: string, data: EditPostFormData): Promise<Post> {
  if (!id) {
    throw new Error('Identificador de publicación inválido.');
  }
  if (!data.course) {
    throw new Error('Debes seleccionar un curso.');
  }
  if (!data.description.trim()) {
    throw new Error('La descripción no puede estar vacía.');
  }

  const type = POST_TYPE_TO_API[data.postType];
  if (!type) {
    throw new Error('Debes seleccionar un tipo de publicación.');
  }

  const payload: PostUpdatePayload = {
    course_id: data.course,
    type,
    description: data.description.trim(),
  };

  return update(id, payload);
}


// MyPostsPage.tsx -> PostController.tsx (removePost) -> PostService.tsx (remove)
// Soft delete: el post desaparece del feed pero queda en el historial.
export async function removePost(id: string): Promise<PostDeleteResponse> {
  if (!id) {
    throw new Error('Identificador de publicación inválido.');
  }

  return remove(id);
}
