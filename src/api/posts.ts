import { apiFetch } from "./client";
import type { Post, PostUpdatePayload } from "../types/post";

export async function getPostById(id: string): Promise<Post> {
  return apiFetch<Post>(`/posts/${id}`);
}

export async function updatePost(
  id: string,
  payload: PostUpdatePayload,
): Promise<Post> {
  return apiFetch<Post>(`/posts/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
