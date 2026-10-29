import { Star } from "lucide-react";
import { Avatar } from "@/components/ui";
import { Profile } from "../types";

export interface ProfileCardProps {
  profile: Profile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <aside className="panel profile-card">
      <div className="profile-cover" />
      <Avatar name={profile.name} src={profile.photo_url} large />
      <h2>{profile.name}</h2>
      <p>
        {profile.major} · Ciclo {profile.academic_cycle}
      </p>
      <span className="rating">
        <Star size={17} />
        {profile.rating ? `${profile.rating} de 5` : "Aún sin calificaciones"}
      </span>
      <p className="bio">{profile.bio || "Todavía no agregó una descripción."}</p>
      <h4>Habilidades</h4>
      <div className="tags">
        {(profile.skills || []).map((s) => (
          <span className="tag" key={s}>
            {s}
          </span>
        ))}
      </div>
      <h4>Intereses</h4>
      <div className="tags">
        {(profile.interests || []).map((s) => (
          <span className="course-tag" key={s}>
            {s}
          </span>
        ))}
      </div>
    </aside>
  );
}
