// Contrato de datos del módulo Publicaciones (H.U 1.2 / 1.4).
// Espeja los DTOs reales del backend (app/schemas/post.py).

export type PostType = 'tutoring' | 'study_group';
export type PostStatus = 'published' | 'hidden';

// Respuesta de GET /posts/:id, POST /posts y PUT /posts/:id (PostResponseDTO).
export interface Post {
  id: string;              // UUID
  user_id: string;         // UUID, el backend lo resuelve; nunca se envía desde el front
  course_id: string;       // UUID
  type: PostType;
  description: string;
  group_id: string;        // UUID; el backend crea el grupo automáticamente al publicar
  status: PostStatus;
  created_at: string;      // ISO datetime
  updated_at: string;      // ISO datetime
}

// Body de PUT /posts/:id (PostUpdateDTO). El backend no acepta group_id:
// el grupo se administra desde el módulo de grupos, no desde el post.
export interface PostUpdatePayload {
  course_id: string;
  type: PostType;
  description: string;
}

// Respuesta de DELETE /posts/:id (DeletePostResponseDTO) — soft delete:
// el backend marca deleted_at y status = "hidden", no destruye el registro.
export interface PostDeleteResponse {
  success: boolean;
  message: string;
  publication_id: string;
  deleted_at: string;
}
