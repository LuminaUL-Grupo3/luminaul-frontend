import { Mail } from "lucide-react";
import { Avatar } from "@/components/ui";
import { StudentProfileDto } from "../types";

export interface ProfileCardProps {
  profile: StudentProfileDto;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const academicInfo = [
    profile.major,
    profile.academicCycle && `Ciclo ${profile.academicCycle}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <aside className="panel profile-card">
      <div className="profile-cover" />
      <Avatar
        name={profile.name}
        src={profile.profilePhotoUrl || undefined}
        large
      />
      <h2>{profile.name}</h2>
      {profile.email && (
        <a
          className="profile-email"
          href={`mailto:${profile.email}`}
          title={`Correo institucional: ${profile.email}`}
        >
          <Mail size={13} />
          <span>{profile.email}</span>
        </a>
      )}
      {academicInfo && <p className="academic-info">{academicInfo}</p>}
      <p className="bio">{profile.bio || "Todavía no agregó una descripción."}</p>
      <h4>Habilidades</h4>
      <div className="tags">
        {profile.skills.map((s) => (
          <span className="tag" key={s}>
            {s}
          </span>
        ))}
      </div>
      <h4>Intereses</h4>
      <div className="tags">
        {profile.interests.map((s) => (
          <span className="course-tag" key={s}>
            {s}
          </span>
        ))}
      </div>
    </aside>
  );
}
