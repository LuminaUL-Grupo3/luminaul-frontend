import { Link, useParams } from "react-router-dom";
import { Pencil } from "lucide-react";
import { useSession } from "@/features/auth";
import { PageHeader, Loading, Notice } from "@/components/ui";
import { useUserProfileQuery } from "../hooks/useProfileQueries";
import { ProfileCard, AvailabilitySchedule } from "../components";
import { UserReviewsSection } from "@/features/reviews";

export function ProfilePage() {
  const { id } = useParams(),
    { user } = useSession(),
    target = id || user!.id,
    own = target === user!.id;
  const profile = useUserProfileQuery(target);

  if (profile.isLoading) return <Loading />;
  const p = profile.data;
  if (!p)
    return (
      <Notice error>
        {profile.error?.message || "No se pudo cargar el perfil"}
      </Notice>
    );

  return (
    <>
      <PageHeader
        eyebrow={own ? "TU ESPACIO EN LA COMUNIDAD" : "CONOCE A TU COMUNIDAD"}
        title={own ? "Mi perfil" : p.name}
        description={
          own
            ? "Lo que sabes puede ser el comienzo de algo compartido."
            : undefined
        }
        action={
          own ? (
            <Link className="button secondary" to="/perfil/editar">
              <Pencil size={16} />
              Editar perfil
            </Link>
          ) : undefined
        }
      />
      <div className="profile-layout">
        <ProfileCard profile={p} />
        <section className="stack">
          <AvailabilitySchedule availability={p.availabilities} own={own} />
          <UserReviewsSection userId={target} userName={p.name} />
        </section>
      </div>
    </>
  );
}
