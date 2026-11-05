import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useSession } from "@/features/auth";
import { useFeedback } from "@/hooks/useFeedback";
import { Avatar, Notice, Field } from "@/components/ui";
import { useUpdateProfileMutation } from "../hooks/useProfileQueries";
import { StudentProfileDto } from "../types";

const parseList = (value: string) =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const emptyToNull = (value: string) => value.trim() || null;

export interface ProfileFormProps {
  profile: StudentProfileDto;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const { user, setUser } = useSession();
  const feedback = useFeedback();
  const updateProfile = useUpdateProfileMutation(),
    [name, setName] = useState(profile.name),
    [bio, setBio] = useState(profile.bio || ""),
    [major, setMajor] = useState(profile.major || ""),
    [academicCycle, setAcademicCycle] = useState(profile.academicCycle || ""),
    [photoUrl, setPhotoUrl] = useState(profile.profilePhotoUrl || ""),
    [skills, setSkills] = useState(profile.skills.join(", ")),
    [interests, setInterests] = useState(profile.interests.join(", ")),
    [error, setError] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (updateProfile.isPending) return;
    setError("");
    try {
      const updated = await updateProfile.mutateAsync({
        name,
        bio: emptyToNull(bio),
        major: emptyToNull(major),
        academicCycle: emptyToNull(academicCycle),
        profilePhotoUrl: emptyToNull(photoUrl),
        skills: parseList(skills),
        interests: parseList(interests),
      });
      setUser({ ...user!, name: updated.name });
      feedback.notify("Perfil actualizado correctamente");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="panel narrow">
      <div className="photo-edit">
        <Avatar large name={name} src={photoUrl.trim() || undefined} />
      </div>
      <form className="form" onSubmit={submit}>
        <Field label="Nombre completo">
          <input
            required
            maxLength={150}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="URL de la foto de perfil">
          <input
            type="url"
            maxLength={255}
            placeholder="https://"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />
        </Field>
        <Field label="Descripción personal">
          <textarea
            maxLength={1000}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </Field>
        <div className="two-cols">
          <Field label="Carrera">
            <input
              maxLength={100}
              value={major}
              onChange={(e) => setMajor(e.target.value)}
            />
          </Field>
          <Field label="Ciclo académico">
            <select
              value={academicCycle}
              onChange={(e) => setAcademicCycle(e.target.value)}
            >
              <option value="">Selecciona tu ciclo</option>
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i + 1} value={String(i + 1)}>
                  Ciclo {i + 1}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Habilidades" hint="Separa con comas.">
          <input value={skills} onChange={(e) => setSkills(e.target.value)} />
        </Field>
        <Field label="Intereses" hint="Separa con comas.">
          <input
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
          />
        </Field>
        <Notice error>{error}</Notice>
        <button className="button" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? (
            <LoaderCircle className="spin" size={18} />
          ) : null}
          {updateProfile.isPending ? "Guardando…" : "Guardar perfil"}
          <ArrowRight size={16} />
        </button>
      </form>
      <Link to="/perfil" className="text-button">
        Volver a mi perfil
      </Link>
    </div>
  );
}
