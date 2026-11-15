import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useSession } from "@/features/auth";
import { useFeedback } from "@/hooks/useFeedback";
import { Avatar, Notice, Field } from "@/components/ui";
import { useUpdateProfileMutation } from "../hooks/useProfileQueries";
import { PROFILE_MAJOR, StudentProfileDto } from "../types";

const parseList = (value: string) =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const emptyToNull = (value: string) => value.trim() || null;

function isValidHttpImageUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    return Boolean(parsed.hostname && (parsed.hostname.includes(".") || parsed.hostname === "localhost"));
  } catch {
    return false;
  }
}

function verifyImageLoads(url: string, timeoutMs = 6000): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
      resolve(ok);
    };
    const timer = window.setTimeout(() => finish(false), timeoutMs);
    img.onload = () => finish(img.naturalWidth > 0);
    img.onerror = () => finish(false);
    img.src = url;
  });
}

export interface ProfileFormProps {
  profile: StudentProfileDto;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const { user, setUser } = useSession();
  const feedback = useFeedback();
  const updateProfile = useUpdateProfileMutation(),
    [bio, setBio] = useState(profile.bio || ""),
    [academicCycle, setAcademicCycle] = useState(profile.academicCycle || ""),
    [photoUrl, setPhotoUrl] = useState(profile.profilePhotoUrl || ""),
    [skills, setSkills] = useState(profile.skills.join(", ")),
    [interests, setInterests] = useState(profile.interests.join(", ")),
    [checkingPhoto, setCheckingPhoto] = useState(false),
    [error, setError] = useState("");

  const isSaving = checkingPhoto || updateProfile.isPending;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (isSaving) return;
    setError("");
    const trimmedPhotoUrl = emptyToNull(photoUrl);
    if (trimmedPhotoUrl) {
      if (!isValidHttpImageUrl(trimmedPhotoUrl)) {
        setError("La foto de perfil debe ser una URL válida (http:// o https://).");
        return;
      }
      setCheckingPhoto(true);
      const loads = await verifyImageLoads(trimmedPhotoUrl);
      setCheckingPhoto(false);
      if (!loads) {
        setError(
          "No se pudo cargar la imagen desde esa URL. Verifica que sea un enlace directo a una imagen válida.",
        );
        return;
      }
    }
    try {
      const updated = await updateProfile.mutateAsync({
        bio: emptyToNull(bio),
        major: PROFILE_MAJOR,
        academicCycle: emptyToNull(academicCycle),
        profilePhotoUrl: trimmedPhotoUrl,
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
        <Avatar large name={profile.name} src={photoUrl.trim() || undefined} />
      </div>
      <form className="form" onSubmit={submit}>
        <Field
          label="Nombre completo"
          hint="El nombre registrado institucionalmente no se puede modificar."
        >
          <input
            disabled
            readOnly
            value={profile.name}
            title="El nombre completo institucional no se puede modificar"
          />
        </Field>
        <Field
          label="URL de la foto de perfil"
          hint="Opcional. Debe ser un enlace http:// o https:// a una imagen válida (se probará antes de guardar)."
        >
          <input
            type="url"
            maxLength={255}
            placeholder="https://"
            value={photoUrl}
            onChange={(e) => {
              setPhotoUrl(e.target.value);
              if (error) setError("");
            }}
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
              disabled
              readOnly
              value={PROFILE_MAJOR}
              title="La carrera no se puede modificar"
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
        <button className="button" disabled={isSaving}>
          {isSaving ? (
            <LoaderCircle className="spin" size={18} />
          ) : null}
          {checkingPhoto
            ? "Verificando imagen…"
            : updateProfile.isPending
              ? "Guardando…"
              : "Guardar perfil"}
          <ArrowRight size={16} />
        </button>
      </form>
      <Link to="/perfil" className="text-button">
        Volver a mi perfil
      </Link>
    </div>
  );
}
