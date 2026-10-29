export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
}

export interface PaginationParams {
  limit?: string;
  offset?: string;
  search?: string;
}

export type Nullable<T> = T | null;
