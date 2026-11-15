import { api } from "@/config/api";
import {
  Course,
  CreatePostPayload,
  DeletePostResponse,
  MyTutoringRequest,
  PostFilterQuery,
  PostGroupDetailMinimal,
  PostGroupSummary,
  Publication,
  TutoringRequestIncoming,
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
    const items = await api.request<Publication[]>(
      `/posts/me${buildQueryString({ limit: params?.limit, offset: params?.offset })}`,
    );

    const search = params?.search?.trim().toLowerCase();
    return items.filter((p) => {
      if (params?.type && p.type !== params.type) return false;
      if (params?.courseId && p.courseId !== params.courseId && p.course?.id !== params.courseId) {
        return false;
      }
      if (typeof params?.cycle === "number" && p.course?.cycle !== params.cycle) {
        return false;
      }
      if (search) {
        const haystack = [
          p.description,
          p.benefits,
          p.requirements,
          p.course?.name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
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

  async createTutoringRequest(
    postId: string,
    message: string,
  ): Promise<{ id: string; status: string; message: string }> {
    return api.request<{ id: string; status: string; message: string }>(
      `/posts/${postId}/tutoring-requests`,
      "POST",
      { message },
    );
  },

  async getIncomingTutoringRequests(): Promise<TutoringRequestIncoming[]> {
    return api.request<TutoringRequestIncoming[]>(
      "/posts/tutoring-requests/incoming",
    );
  },

  async getMyTutoringRequests(): Promise<MyTutoringRequest[]> {
    return api.request<MyTutoringRequest[]>("/posts/tutoring-requests/mine");
  },

  async decideTutoringRequest(
    requestId: string,
    status: "accepted" | "rejected",
  ): Promise<{ id: string; status: string }> {
    return api.request<{ id: string; status: string }>(
      `/posts/tutoring-requests/${requestId}`,
      "PATCH",
      { status },
    );
  },
};
