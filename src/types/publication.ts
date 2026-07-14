// Tipos del dominio de Publicaciones (Épica 1), alineados con el
// "Acuerdo Oficial de Endpoints" del Sprint 1 (base /api/v1).

export type PublicationType = "study_group" | "tutoring";

export type PublicationStatus = "published" | "hidden";

// Autor embebido que devuelve el feed para pintar la tarjeta sin pedir más datos.
export interface PublicationAuthor {
  user_id: string;
  name: string;
  profile_photo_url: string;
}

// Curso embebido en la publicación (subconjunto de Course).
export interface PublicationCourse {
  id: string;
  name: string;
  cycle: number;
}

// Publicación tal como llega en el feed: GET /publications (HU 1.3 y 1.5).
export interface Publication {
  id: string;
  type: PublicationType;
  description: string;
  group_id: string | null;
  status: PublicationStatus;
  created_at: string;
  author: PublicationAuthor;
  course: PublicationCourse;
}
