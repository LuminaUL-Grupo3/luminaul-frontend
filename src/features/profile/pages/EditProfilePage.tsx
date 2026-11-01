import { PageHeader, Loading, Notice } from "@/components/ui";
import { useMyProfileQuery } from "../hooks/useProfileQueries";
import { ProfileForm } from "../components";

export function EditProfilePage() {
  const profile = useMyProfileQuery();

  return (
    <>
      <PageHeader eyebrow="CUÉNTALE A TU COMUNIDAD" title="Editar mi perfil" />
      <Notice error>{profile.error?.message}</Notice>
      {profile.isLoading ? (
        <Loading />
      ) : (
        profile.data && <ProfileForm profile={profile.data} />
      )}
    </>
  );
}
