import { useSession } from "@/features/auth";
import { useResource } from "@/hooks/useResource";
import { PageHeader, Loading, Notice } from "@/components/ui";
import { Profile } from "../types";
import { ProfileForm } from "../components";

export function EditProfilePage() {
  const { user } = useSession();
  const resource = useResource<Profile | null>("/profiles/me", null);
  const fallbackProfile: Profile = {
    user_id: user?.id || "",
    name: user?.name || "Estudiante",
    major: "Ingeniería de Sistemas",
    academic_cycle: 5,
    bio: "Estudiante de la Universidad de Lima",
    skills: ["Trabajo en equipo", "Resolución de problemas"],
    interests: ["Software", "Bases de datos"],
    availability: [],
    rating: 5,
  };
  const profileToEdit = resource.data || fallbackProfile;

  return (
    <>
      <PageHeader eyebrow="CUÉNTALE A TU COMUNIDAD" title="Editar mi perfil" />
      <Notice error>{resource.error}</Notice>
      {resource.loading ? (
        <Loading />
      ) : (
        <ProfileForm profile={profileToEdit} />
      )}
    </>
  );
}
