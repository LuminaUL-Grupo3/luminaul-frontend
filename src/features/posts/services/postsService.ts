import { api } from "@/config/api";
import {
  Course,
  CreatePostPayload,
  DeletePostResponse,
  PostFilterQuery,
  PostGroupDetailMinimal,
  PostGroupSummary,
  Publication,
  UpdatePostPayload,
} from "../types";

function buildQueryString(params?: PostFilterQuery): string {
  if (!params) return "";
  const search = new URLSearchParams();
  if (typeof params.limit === "number") search.set("limit", String(params.limit));
  if (typeof params.offset === "number") search.set("offset", String(params.offset));
  if (params.search) search.set("search", params.search);
  if (params.type) search.set("type", params.type);
  if (params.courseId) search.set("courseId", params.courseId);
  if (typeof params.cycle === "number") search.set("cycle", String(params.cycle));
  const raw = search.toString();
  return raw ? `?${raw}` : "";
}

export const postsService = {
  async getPosts(params?: PostFilterQuery): Promise<Publication[]> {
    return api.request<Publication[]>(`/posts${buildQueryString(params)}`);
  },

  async getMyPosts(params?: PostFilterQuery): Promise<Publication[]> {
    return api.request<Publication[]>(`/posts/me${buildQueryString(params)}`);
  },

  async getPostById(id: string): Promise<Publication> {
    return api.request<Publication>(`/posts/${id}`);
  },

  async createPost(payload: CreatePostPayload): Promise<Publication> {
    return api.request<Publication>("/posts", "POST", payload);
  },

  async updatePost(id: string, payload: UpdatePostPayload): Promise<Publication> {
    return api.request<Publication>(`/posts/${id}`, "PUT", payload);
  },

  async deletePost(id: string): Promise<DeletePostResponse> {
    return api.request<DeletePostResponse>(`/posts/${id}`, "DELETE");
  },

  async getCourses(): Promise<Course[]> {
    return api.request<Course[]>("/courses");
  },

  async getMyGroups(): Promise<PostGroupSummary[]> {
    return api.request<PostGroupSummary[]>("/groups/me");
  },

  async getGroupDetail(groupId: string): Promise<PostGroupDetailMinimal> {
    return api.request<PostGroupDetailMinimal>(`/groups/${groupId}`);
  },

  async requestJoinGroup(
    groupId: string,
    message: string,
  ): Promise<{ message: string }> {
    return api.request<{ message: string }>(`/groups/${groupId}/join-requests`, "POST", {
      message,
    });
  },
};
