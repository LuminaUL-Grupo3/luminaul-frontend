import { useState } from "react";
import { Link } from "react-router-dom";
import { Camera } from "lucide-react";
import { api } from "@/config/api";
import { useSession } from "@/features/auth";
import { Avatar, Notice, ActionForm, Field } from "@/components/ui";
import { Profile } from "../types";

export interface ProfileFormProps {
  profile: Profile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const { user, setUser } = useSession(),
    [form, setForm] = useState(profile),
    [skills, setSkills] = useState((profile.skills || []).join(", ")),
    [interests, setInterests] = useState((profile.interests || []).join(", ")),
    [photoError, setPhotoError] = useState(""),
    [uploading, setUploading] = useState(false);

  return (
    <div className="panel narrow">
      <div className="photo-edit">
        <Avatar large name={form.name} src={form.photo_url} />
        <label className="button secondary">
          <Camera size={18} />
          {uploading ? "Subiendo…" : "Cambiar foto"}
          <input
            type="file"
            hidden
            accept="image/png,image/jpeg,image/webp"
            disabled={uploading}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploading(true);
              setPhotoError("");
              try {
                if (file.size > 2 * 1024 * 1024)
                  throw new Error("La imagen debe pesar menos de 2 MB");
                const data = new FormData();
                data.append("photo", file);
                const r = await api.request<{ photo_url: string }>(
                  "/profiles/me/photo",
                  "POST",
                  data,
                );
                setForm({ ...form, photo_url: r.photo_url });
              } catch (e) {
                setPhotoError((e as Error).message);
              } finally {
                setUploading(false);
              }
            }}
          />
        </label>
      </div>
      <Notice error>{photoError}</Notice>
      <ActionForm
        path="/profiles/me"
        method="PUT"
        payload={() => ({
          name: form.name,
          bio: form.bio,
          major: form.major,
          academic_cycle: form.academic_cycle,
          skills: skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          interests: interests
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        })}
        label="Guardar perfil"
        done={() => setUser({ ...user!, name: form.name })}
      >
        <Field label="Nombre completo">
          <input
            required
            minLength={2}
            maxLength={100}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Descripción personal">
          <textarea
            maxLength={1500}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
          />
        </Field>
        <div className="two-cols">
          <Field label="Carrera">
            <input
              required
              minLength={2}
              maxLength={100}
              value={form.major}
              onChange={(e) => setForm({ ...form, major: e.target.value })}
            />
          </Field>
          <Field label="Ciclo académico">
            <input
              type="number"
              min={1}
              max={10}
              required
              value={form.academic_cycle}
              onChange={(e) =>
                setForm({ ...form, academic_cycle: Number(e.target.value) })
              }
            />
          </Field>
        </div>
        <Field label="Habilidades" hint="Separa con comas. Máximo 15.">
          <input value={skills} onChange={(e) => setSkills(e.target.value)} />
        </Field>
        <Field label="Intereses" hint="Separa con comas. Máximo 15.">
          <input
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
          />
        </Field>
      </ActionForm>
      <Link to="/perfil" className="text-button">
        Volver a mi perfil
      </Link>
    </div>
  );
}
