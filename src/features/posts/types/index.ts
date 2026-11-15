export type PostType = "study_group" | "tutoring";
export type PostStatus = "published" | "hidden" | "inactive";
export type PostMeetingMode = "presencial" | "virtual" | "hibrido";
export type PostMeetingShift = "manana" | "tarde" | "noche";

export interface Course {
  id: string;
  name: string;
  cycle: number | null;
}

export interface PostAuthor {
  id: string;
  name: string;
  profilePhotoUrl?: string | null;
}

export interface Publication {
  color?: string;
  id: string;
  userId?: string;
  groupId?: string | null;
  courseId?: string;
  type: PostType;
  description: string;
  benefits?: string | null;
  requirements?: string | null;
  maxCapacity?: number;
  groupCurrentMembers?: number | null;
  groupMaxCapacity?: number | null;
  status: PostStatus | string;
  createdAt?: string;
  updatedAt?: string;
  author?: PostAuthor;
  course?: Course;
}

export interface PostFilterQuery {
  courseId?: string;
  type?: PostType;
  cycle?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface CreatePostPayload {
  type: PostType;
  courseId: string;
  groupId?: string;
  description: string;
  color?: string;
  benefits?: string;
  requirements?: string;
  maxCapacity?: number;
  meetingMode?: PostMeetingMode;
  meetingShift?: PostMeetingShift;
}

export interface UpdatePostPayload {
  groupId?: string | null;
  description?: string;
  color?: string;
  benefits?: string;
  requirements?: string;
  maxCapacity?: number;
}

export interface DeletePostResponse {
  success: boolean;
  message: string;
  deletedId: string;
  deletedAt: string;
}

export interface PostGroupSummary {
  id: string;
  name: string;
  description?: string | null;
  courseCode?: string;
  myRole?: string | null;
  maxCapacity?: number;
  currentMembers?: number;
}

export interface PostGroupDetailMinimal {
  id: string;
  myRole: "leader" | "member" | null;
  pendingRequest: boolean;
}

export interface PaginatedPostsResponse {
  total: number;
  limit: number;
  offset: number;
  items: Publication[];
}

export type TutoringRequestStatus = "pending" | "accepted" | "rejected";

export interface TutoringRequestIncoming {
  id: string;
  publicationId: string;
  tutorId: string;
  requesterId: string;
  message: string;
  status: TutoringRequestStatus;
  createdAt: string;
  courseName: string;
  publicationDescription: string;
  applicant: {
    id: string;
    name: string;
    email: string;
    profilePhotoUrl: string | null;
  };
}

export interface MyTutoringRequest {
  id: string;
  publicationId: string;
  status: TutoringRequestStatus;
  groupId: string | null;
  createdAt: string;
}
