import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileService } from "../services/profileService";
import { UpdateAvailabilityRequest } from "../types";

const PROFILE_KEY = "profile";

export function useMyProfileQuery() {
  return useQuery({
    queryKey: [PROFILE_KEY, "me"],
    queryFn: profileService.getMyProfile,
    retry: false,
  });
}

export function useUserProfileQuery(userId: string) {
  return useQuery({
    queryKey: [PROFILE_KEY, userId],
    queryFn: () => profileService.getProfile(userId),
    retry: false,
  });
}

// Tras cualquier cambio se invalidan "me" y el perfil por id del mismo usuario
function useInvalidateProfiles() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: [PROFILE_KEY] });
}

export function useUpdateProfileMutation() {
  const invalidate = useInvalidateProfiles();
  return useMutation({
    mutationFn: profileService.updateMyProfile,
    onSuccess: invalidate,
  });
}

export function useCreateAvailabilityMutation() {
  const invalidate = useInvalidateProfiles();
  return useMutation({
    mutationFn: profileService.createAvailability,
    onSuccess: invalidate,
  });
}

export function useUpdateAvailabilityMutation() {
  const invalidate = useInvalidateProfiles();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateAvailabilityRequest;
    }) => profileService.updateAvailability(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteAvailabilityMutation() {
  const invalidate = useInvalidateProfiles();
  return useMutation({
    mutationFn: profileService.deleteAvailability,
    onSuccess: invalidate,
  });
}
