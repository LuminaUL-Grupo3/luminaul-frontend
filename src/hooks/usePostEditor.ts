import { useEffect, useState } from "react";
import { getPostById, updatePost } from "../api/posts";
import type { Post, PostUpdatePayload } from "../types/post";

type Status = "idle" | "loading" | "saving" | "success" | "error";
type SaveStatus = "idle" | "saving" | "success" | "error";

export function usePostEditor(postId: string | null) {
  const [post, setPost] = useState<Post | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;
    let cancelled = false;

    getPostById(postId)
      .then((data) => {
        if (cancelled) return;
        setPost(data);
        setLoadError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : "No se pudo cargar el post");
      });

    return () => {
      cancelled = true;
    };
  }, [postId]);

  const isLoading = postId != null && post?.id !== postId && !loadError;
  const status: Status = saveStatus !== "idle"
    ? saveStatus
    : loadError
      ? "error"
      : isLoading
        ? "loading"
        : "idle";
  const error = loadError ?? saveError;

  async function save(payload: PostUpdatePayload) {
    if (!postId) return;
    setSaveStatus("saving");
    setSaveError(null);
    try {
      const updated = await updatePost(postId, payload);
      setPost(updated);
      setSaveStatus("success");
      return updated;
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : "No se pudo actualizar el post");
      setSaveStatus("error");
      throw err;
    }
  }

  return { post, status, error, save };
}
