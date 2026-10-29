import { api } from "../../../config/api";
import { Group, GroupDetail, Message, Chat } from "../types";

export const groupsService = {
  async getGroups(): Promise<Group[]> {
    return api.request<Group[]>("/groups");
  },

  async getGroupById(id: string): Promise<Group> {
    return api.request<Group>(`/groups/${id}`);
  },

  async getGroupDetail(id: string): Promise<GroupDetail> {
    return api.request<GroupDetail>(`/groups/${id}`);
  },

  async leaveGroup(id: string): Promise<{ message: string }> {
    return api.request<{ message: string }>(`/groups/${id}/leave`, "POST");
  },

  async removeMember(groupId: string, userId: string): Promise<{ message: string }> {
    return api.request<{ message: string }>(`/groups/${groupId}/members/${userId}`, "DELETE");
  },

  async transferAdmin(groupId: string, newAdminId: string): Promise<{ message: string }> {
    return api.request<{ message: string }>(`/groups/${groupId}/admin`, "PUT", {
      admin_id: newAdminId,
    });
  },
};

export const chatService = {
  async getChats(): Promise<Chat[]> {
    return api.request<Chat[]>("/chats");
  },

  async getMessages(groupId: string, limit = 50): Promise<Message[]> {
    return api.request<Message[]>(`/groups/${groupId}/messages?limit=${limit}`);
  },

  async markAsRead(groupId: string): Promise<void> {
    await api.request(`/groups/${groupId}/read`, "POST");
  },
};
