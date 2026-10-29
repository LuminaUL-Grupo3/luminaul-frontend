import { api } from "../../../config/api";
import { Publication, Course, CreatePostPayload, UpdatePostPayload } from "../types";

export const postsService = {
  async getPosts(params?: Record<string, string>): Promise<Publication[]> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return api.request<Publication[]>(`/posts${qs}`);
  },

  async getMyPosts(params?: Record<string, string>): Promise<Publication[]> {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : "";
    return api.request<Publication[]>(`/posts/me${qs}`);
  },

  async getPostById(id: string): Promise<Publication> {
    return api.request<Publication>(`/posts/${id}`);
  },

  async createPost(payload: CreatePostPayload): Promise<{ message: string; post?: Publication }> {
    return api.request<{ message: string; post?: Publication }>("/posts", "POST", payload);
  },

  async updatePost(id: string, payload: UpdatePostPayload): Promise<{ message: string }> {
    return api.request<{ message: string }>(`/posts/${id}`, "PUT", payload);
  },

  async deletePost(id: string): Promise<{ message: string }> {
    return api.request<{ message: string }>(`/posts/${id}`, "DELETE");
  },

  async getCourses(): Promise<Course[]> {
    return api.request<Course[]>("/courses");
  },
};
