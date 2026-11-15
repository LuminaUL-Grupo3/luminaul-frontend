import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/config/queryKeys";
import { useSession } from "@/features/auth";
import { postsService } from "../services/postsService";
import {
  CreatePostPayload,
  PostFilterQuery,
  UpdatePostPayload,
} from "../types";

export const postKeys = {
  root: queryKeys.posts,
  feed: (userId: string, filters: PostFilterQuery) =>
    [...queryKeys.posts, "feed", userId, filters] as const,
  mine: (userId: string, filters: PostFilterQuery) =>
    [...queryKeys.posts, "mine", userId, filters] as const,
  detail: (postId: string) => [...queryKeys.posts, "detail", postId] as const,
  courses: queryKeys.courses,
  myGroups: (userId: string) => [...queryKeys.chatGroups, "mine", userId] as const,
  groupDetail: (userId: string, groupId: string) =>
    [...queryKeys.chatGroups, "detail", userId, groupId] as const,
};

export function usePostsFeedQuery(
  filters: PostFilterQuery,
  options?: { mine?: boolean },
) {
  const { user } = useSession();
  const mine = Boolean(options?.mine);
  const userId = user?.id || "";
  return useQuery({
    queryKey: mine ? postKeys.mine(userId, filters) : postKeys.feed(userId, filters),
    queryFn: () =>
      mine ? postsService.getMyPosts(filters) : postsService.getPosts(filters),
    enabled: Boolean(userId),
  });
}

export function usePostDetailQuery(id?: string) {
  return useQuery({
    queryKey: postKeys.detail(id || ""),
    queryFn: () => postsService.getPostById(id as string),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useCoursesQuery() {
  return useQuery({
    queryKey: postKeys.courses,
    queryFn: postsService.getCourses,
    staleTime: 60_000,
  });
}

export function useMyGroupsSummaryQuery(enabled = true) {
  const { user } = useSession();
  const userId = user?.id || "";
  return useQuery({
    queryKey: postKeys.myGroups(userId),
    queryFn: postsService.getMyGroups,
    enabled: Boolean(userId) && enabled,
    staleTime: 15_000,
  });
}

function useInvalidatePostsAndGroups() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.posts }),
      queryClient.invalidateQueries({ queryKey: queryKeys.chatGroups }),
    ]);
}

export function useCreatePostMutation() {
  const invalidate = useInvalidatePostsAndGroups();
  return useMutation({
    mutationFn: (payload: CreatePostPayload) => postsService.createPost(payload),
    onSuccess: invalidate,
  });
}

export function useUpdatePostMutation(id: string) {
  const invalidate = useInvalidatePostsAndGroups();
  return useMutation({
    mutationFn: (payload: UpdatePostPayload) => postsService.updatePost(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeletePostMutation() {
  const invalidate = useInvalidatePostsAndGroups();
  return useMutation({
    mutationFn: (id: string) => postsService.deletePost(id),
    onSuccess: invalidate,
  });
}

export function useJoinGroupMutation() {
  const invalidate = useInvalidatePostsAndGroups();
  return useMutation({
    mutationFn: ({ groupId, message }: { groupId: string; message: string }) =>
      postsService.requestJoinGroup(groupId, message),
    onSuccess: invalidate,
  });
}

export function useMyTutoringRequestsQuery(enabled = true) {
  return useQuery({
    queryKey: ["posts", "tutoring-requests", "mine"],
    queryFn: () => postsService.getMyTutoringRequests(),
    enabled,
  });
}

export function useIncomingTutoringRequestsQuery(enabled = true) {
  return useQuery({
    queryKey: ["posts", "tutoring-requests", "incoming"],
    queryFn: () => postsService.getIncomingTutoringRequests(),
    enabled,
  });
}

export function useCreateTutoringRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, message }: { postId: string; message: string }) =>
      postsService.createTutoringRequest(postId, message),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["posts", "tutoring-requests"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["groups"],
      });
    },
  });
}

export function useDecideTutoringRequestMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      status,
    }: {
      requestId: string;
      status: "accepted" | "rejected";
    }) => postsService.decideTutoringRequest(requestId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["posts", "tutoring-requests"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["groups"],
      });
    },
  });
}

