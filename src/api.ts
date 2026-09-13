export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
}
export interface Course {
  id: string;
  name: string;
  cycle: number;
}
export interface Publication {
  id: string;
  user_id: string;
  group_id: string;
  course_id: string;
  type: "study_group" | "tutoring";
  description: string;
  status: string;
  created_at: string;
  author_name: string;
  course_name: string;
  cycle: number;
  group_name: string;
  benefits: string;
  requirements: string;
  max_capacity: number;
  photo_url?: string;
}
export interface Member {
  user_id: string;
  name: string;
  role: string;
  photo_url?: string;
}
export interface Group {
  id: string;
  name: string;
  description: string;
  benefits: string;
  requirements: string;
  admin_id: string;
  max_capacity: number;
  member_count: number;
  role: string;
  members: Member[];
}
export interface Availability {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}
export interface Profile {
  user_id: string;
  name: string;
  bio: string;
  major: string;
  academic_cycle: number;
  photo_url?: string;
  skills: string[];
  interests: string[];
  availability: Availability[];
  rating?: number;
}
export interface Review {
  id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  rating: number;
  comment: string;
  author_name: string;
  target_name: string;
  created_at: string;
  status: string;
}
export interface Message {
  id: string;
  group_id: string;
  sender_id: string;
  content: string;
  author_name: string;
  created_at: string;
  status: string;
}
export interface Chat {
  id: string;
  name: string;
  last_message: string;
  last_activity: string;
  unread: number;
}
export interface JoinRequest {
  id: string;
  group_id: string;
  requester_id: string;
  requester_name: string;
  group_name: string;
  message: string;
  created_at: string;
}
export interface Notice {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
export interface Moderated {
  publication_id?: string;
  message_id?: string;
  review_id?: string;
  id: string;
  content: string;
  reason: string;
  result: string;
  created_at: string;
  appeal_status?: string;
}
export interface Appeal {
  content: string;
  user_id: string;
  id: string;
  justification: string;
  status: string;
  author_name: string;
  reason: string;
  resolution?: string;
  created_at: string;
}
export interface Report {
  author_name: string;
  author_status: string;
  author_role: string;
  id: string;
  content: string;
  reason: string;
  status: string;
  author_id: string;
  publication_id?: string;
  message_id?: string;
  review_id?: string;
  created_at: string;
}
export interface AdminUser extends User {
  status: string;
}
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}
export class ApiClient {
  async request<T>(path: string, method = "GET", body?: unknown): Promise<T> {
    const multipart = body instanceof FormData;
    const response = await fetch(`/api/v1${path}`, {
      method,
      credentials: "include",
      headers:
        body && !multipart ? { "Content-Type": "application/json" } : undefined,
      body: body ? (multipart ? body : JSON.stringify(body)) : undefined,
    });
    const data = await response
      .json()
      .catch(() => ({ message: "Respuesta no válida del servidor" }));
    if (!response.ok) {
      if (response.status === 401 && !path.startsWith("/auth/"))
        window.dispatchEvent(new Event("session-expired"));
      throw new ApiError(
        Array.isArray(data.message)
          ? data.message.join(". ")
          : data.message || "No se pudo completar la operación",
        response.status,
      );
    }
    return data as T;
  }
}
export const api = new ApiClient();
export const date = (value: string) =>
  new Date(value).toLocaleString("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
export const days = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];
