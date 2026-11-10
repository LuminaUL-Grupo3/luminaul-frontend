import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { profileService } from "../services/profileService";
import { StudentProfileDto, UpdateAvailabilityRequest } from "../types";

const PROFILE_KEY = "profile";

// enabled permite al Layout esperar a que haya sesión antes de pedir /profiles/me
export function useMyProfileQuery(enabled = true) {
  return useQuery({
    queryKey: [PROFILE_KEY, "me"],
    queryFn: profileService.getMyProfile,
    retry: false,
    enabled,
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

// La foto y los datos del perfil también se muestran en publicaciones, reseñas y chat:
// se guarda la respuesta para que la barra superior cambie al instante y se invalidan
// todas las consultas para que el resto de pantallas vuelva a pedir los datos actuales
export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileService.updateMyProfile,
    onSuccess: (updated: StudentProfileDto) => {
      queryClient.setQueryData([PROFILE_KEY, "me"], updated);
      queryClient.setQueryData([PROFILE_KEY, updated.userId], updated);
      return queryClient.invalidateQueries();
    },
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
