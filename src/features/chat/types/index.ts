export interface Member {
  user_id: string;
  name: string;
  role: string;
  photo_url?: string;
}

export type GroupMember = Member;


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

export type GroupMembershipStatus = "admin" | "member" | "pending" | "none";

export interface GroupDetail {
  id: string;
  name: string;
  description: string | null;
  benefits: string | null;
  requirements: string | null;
  meeting_mode: string | null;
  meeting_shift: string | null;
  max_capacity: number | null;
  member_count: number;
  admin_id: string;
  admin: { user_id: string; name: string; profile_photo_url: string | null };
  my_status: GroupMembershipStatus;
  created_at: string;
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

export type JoinRequestStatus = "pending" | "accepted" | "rejected";
export type JoinRequestAction = "accepted" | "rejected";

export interface JoinRequestGroup {
  group_id: string;
  group_name: string;
}

export interface JoinRequestRequester {
  user_id: string;
  name: string;
  profile_photo_url: string | null;
}

export interface JoinRequestItem {
  id: string;
  group: JoinRequestGroup;
  requester: JoinRequestRequester;
  status: JoinRequestStatus;
  message: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  responded_at: string | null;
}

export interface JoinRequestListResponse {
  requests: JoinRequestItem[];
  total: number;
  message: string | null;
}

export interface RespondJoinRequestPayload {
  action: JoinRequestAction;
}

export interface RespondJoinRequestResponse {
  request: JoinRequestItem;
  message: string;
}

export interface JoinRequest {
  id: string;
  group_id?: string;
  requester_id?: string;
  requester_name?: string;
  group_name?: string;
  message: string | null;
  created_at: string;
  group?: JoinRequestGroup;
  requester?: JoinRequestRequester;
  status?: JoinRequestStatus;
}
