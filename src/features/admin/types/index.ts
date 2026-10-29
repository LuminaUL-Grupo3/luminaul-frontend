import { User } from "../../../types/common";

export interface NoticeNotification {
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
