// Tipos del dominio de Publicaciones. La entidad se nombra "Post" para coincidir
// con los diagramas de secuencia y con PostController/PostService (informe oficial).

export type PostType = "study_group" | "tutoring";

export type PostStatus = "published" | "hidden";

// Autor embebido que devuelve el feed para pintar la tarjeta sin pedir más datos.
export interface PostAuthor {
  user_id: string;
  name: string;
  profile_photo_url: string | null;
}

// Curso embebido en el post (subconjunto de Course).
export interface PostCourse {
  id: string;
  name: string;
  cycle: number;
}

// Post tal como llega en el feed: GET /api/v1/posts (HU 1.3 y 1.5).
export interface Post {
  id: string;
  type: PostType;
  description: string;
  group_id: string | null;
  status: PostStatus;
  created_at: string;
  author: PostAuthor;
  course: PostCourse;
}
