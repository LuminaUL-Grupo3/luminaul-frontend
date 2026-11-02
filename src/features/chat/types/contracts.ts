export type GroupRole = "leader" | "member";
export type MemberStatus = "active" | "left" | "kicked";
export type RequestStatus = "pending" | "approved" | "rejected";
export type MeetingMode = "presencial" | "virtual" | "hibrido";
export type MeetingShift = "manana" | "tarde" | "noche";
export type MessageStatus = "published" | "hidden" | "deleted";
export const reactionEmojis = ["❤️", "😂", "👍", "🔥"] as const;
export type ReactionEmoji = (typeof reactionEmojis)[number];
export interface GroupMemberDto {
  userId: string;
  name: string;
  role: GroupRole;
  status: MemberStatus;
  profilePhotoUrl: string | null;
  joinedAt: string;
}
export interface GroupDetailDto {
  id: string;
  name: string;
  description: string | null;
  courseCode: string;
  leaderId: string;
  meetingMode: MeetingMode;
  meetingShift: MeetingShift;
  maxCapacity: number;
  currentMembers: number;
  leader: { id: string; name: string; profilePhotoUrl: string | null };
  myRole: GroupRole | null;
  myStatus: MemberStatus | "none";
  createdAt: string;
  pendingRequest: boolean;
  benefits: string | null;
  requirements: string | null;
  lastMessage: string | null;
  lastActivity: string;
  unreadCount: number;
}
export interface JoinRequestDto {
  id: string;
  groupId: string;
  userId: string;
  groupName: string;
  status: RequestStatus;
  message: string | null;
  createdAt: string;
  applicant: {
    id: string;
    name: string;
    email: string;
    profilePhotoUrl: string | null;
  };
}
export interface GroupMessageDto {
  id: string;
  groupId: string;
  senderId: string;
  content: string;
  status: MessageStatus;
  createdAt: string;
  sender: { id: string; name: string; profilePhotoUrl: string | null };
  clientMessageId: string | null;
  replyTo: {
    id: string;
    senderName: string;
    content: string | null;
    status: MessageStatus;
  } | null;
  reactions: { emoji: ReactionEmoji; userIds: string[] }[];
  readBy: { userId: string; name: string }[];
}
export interface CreateGroupRequest {
  name: string;
  description?: string;
  courseCode: string;
  meetingMode: MeetingMode;
  meetingShift: MeetingShift;
  maxCapacity: number;
}
export interface GroupFilter {
  courseCode?: string;
  meetingMode?: MeetingMode | "";
  limit?: number;
  offset?: number;
}
export interface ActionResponse {
  message: string;
}
export interface JoinResponse extends ActionResponse {
  id: string;
  status: "pending";
}
export interface SendMessageRequest {
  groupId: string;
  content: string;
  clientMessageId: string;
  replyToId?: string;
}
export interface TypingEvent {
  groupId: string;
  userId: string;
  name: string;
  isTyping: boolean;
}
export interface PresenceEvent {
  groupId: string;
  userIds: string[];
}
export interface ReadEvent {
  groupId: string;
  userId: string;
  messageId: string;
  name: string;
}
export interface HiddenEvent {
  groupId: string;
  messageId: string;
}
export interface RevokedEvent {
  groupId: string;
  userId: string;
}
export interface ChatError {
  message: string;
  code: string;
}
export type WsAck<T extends object> =
  | ({ success: true } & T)
  | { success: false; error: ChatError };
export type ChatCommand =
  | "chat:join_room"
  | "chat:leave_room"
  | "chat:send_message"
  | "chat:typing"
  | "reaction:add"
  | "reaction:remove"
  | "message:read";
