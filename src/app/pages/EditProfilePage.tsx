import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { User, Camera, X, Clock, ArrowRight } from 'lucide-react';
import { Toast } from '../components/Toast';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}


export function EditProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const FULL_NAME = 'Nombre del Estudiante';
  const CARRERA   = 'Ingeniería de Sistemas';
  const CICLO     = '5';

  const [form, setForm] = useState({
    bio: '',
    intereses: ['Programación', 'IA'],
    habilidades: ['React', 'Python'],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [interesInput, setInteresInput] = useState('');
  const [habilidadInput, setHabilidadInput] = useState('');
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    setErrors({});
    return true;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setToast({ show: true, message: 'Perfil actualizado con éxito.', type: 'success' });
    setTimeout(() => navigate('/perfil'), 1800);
  };

  const addTag = (
    list: string[],
    key: keyof typeof form,
    value: string,
    setValue: (v: string) => void
  ) => {
    const trimmed = value.trim();
    if (trimmed && !list.includes(trimmed)) {
      setForm((prev) => ({ ...prev, [key]: [...list, trimmed] }));
    }
    setValue('');
  };

  const removeTag = (key: keyof typeof form, tag: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: (prev[key] as string[]).filter((t) => t !== tag),
    }));
  };

  return (
    <>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl mb-2">Editar Perfil</h1>
          <p className="text-muted-foreground">Actualiza tu información personal y académica</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Foto de perfil */}
          <div className="bg-white rounded-xl border border-border p-6">
            <h3 className="text-lg font-medium mb-4">Foto de perfil</h3>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-white" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-10 px-4 border border-border rounded-lg text-sm hover:border-primary hover:text-primary transition-colors"
                >
                  Cambiar foto
                </button>
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={() => setAvatarPreview(null)}
                    className="ml-3 h-10 px-4 border border-border rounded-lg text-sm text-muted-foreground hover:border-destructive hover:text-destructive transition-colors"
                  >
                    Eliminar
                  </button>
                )}
                <p className="text-xs text-muted-foreground mt-2">JPG, PNG o GIF. Máximo 5 MB.</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          {/* Información básica */}
          <div className="bg-white rounded-xl border border-border p-6 space-y-5">
            <h3 className="text-lg font-medium">Información básica</h3>

            {/* Nombre completo — solo lectura */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Nombre completo</label>
              <input
                type="text"
                value={FULL_NAME}
                readOnly
                tabIndex={-1}
                className="w-full h-12 px-4 bg-secondary border border-border rounded-lg text-muted-foreground cursor-not-allowed select-none"
              />
              <p className="text-xs text-muted-foreground">
                Este dato se obtiene automáticamente de las credenciales institucionales y no puede modificarse.
              </p>
            </div>

            {/* Carrera + Ciclo — solo lectura */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Carrera</label>
                <input
                  type="text"
                  value={CARRERA}
                  readOnly
                  tabIndex={-1}
                  className="w-full h-12 px-4 bg-secondary border border-border rounded-lg text-muted-foreground cursor-not-allowed select-none"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Ciclo académico</label>
                <input
                  type="text"
                  value={`Ciclo ${CICLO}`}
                  readOnly
                  tabIndex={-1}
                  className="w-full h-12 px-4 bg-secondary border border-border rounded-lg text-muted-foreground cursor-not-allowed select-none"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Esta información es sincronizada con el sistema institucional y no puede modificarse.
            </p>
          </div>

          {/* Biografía */}
          <div className="bg-white rounded-xl border border-border p-6 space-y-2">
            <h3 className="text-lg font-medium mb-1">Sobre mí</h3>
            <label className="block text-sm font-medium text-foreground">Biografía</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Cuéntanos un poco sobre ti, tus objetivos académicos o lo que te apasiona..."
              rows={4}
              maxLength={300}
              className="w-full px-4 py-3 bg-white border border-input rounded-lg focus:border-primary focus:outline-none transition-colors resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">{form.bio.length}/300</p>
          </div>

          {/* Intereses académicos */}
          <div className="bg-white rounded-xl border border-border p-6 space-y-3">
            <h3 className="text-lg font-medium">Intereses académicos</h3>
            <div className="flex flex-wrap gap-2">
              {form.intereses.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag('intereses', tag)}
                    className="hover:opacity-70 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={interesInput}
                onChange={(e) => setInteresInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(form.intereses, 'intereses', interesInput, setInteresInput);
                  }
                }}
                placeholder="Ej: Machine Learning, Diseño UX..."
                className="flex-1 h-10 px-4 bg-white border border-input rounded-lg focus:border-primary focus:outline-none transition-colors text-sm"
              />
              <button
                type="button"
                onClick={() => addTag(form.intereses, 'intereses', interesInput, setInteresInput)}
                className="h-10 px-4 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm font-medium"
              >
                Agregar
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Presiona Enter o el botón para agregar un interés.</p>
          </div>

          {/* Habilidades */}
          <div className="bg-white rounded-xl border border-border p-6 space-y-3">
            <h3 className="text-lg font-medium">Habilidades</h3>
            <div className="flex flex-wrap gap-2">
              {form.habilidades.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-foreground rounded-full text-sm font-medium border border-border"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag('habilidades', tag)}
                    className="hover:opacity-70 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={habilidadInput}
                onChange={(e) => setHabilidadInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(form.habilidades, 'habilidades', habilidadInput, setHabilidadInput);
                  }
                }}
                placeholder="Ej: React, Figma, SQL..."
                className="flex-1 h-10 px-4 bg-white border border-input rounded-lg focus:border-primary focus:outline-none transition-colors text-sm"
              />
              <button
                type="button"
                onClick={() => addTag(form.habilidades, 'habilidades', habilidadInput, setHabilidadInput)}
                className="h-10 px-4 bg-secondary border border-border text-foreground rounded-lg hover:border-primary hover:text-primary transition-colors text-sm font-medium"
              >
                Agregar
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Presiona Enter o el botón para agregar una habilidad.</p>
          </div>

          {/* Disponibilidad horaria */}
          <button
            type="button"
            onClick={() => navigate('/perfil/disponibilidad')}
            className="w-full bg-white rounded-xl border border-border p-5 hover:border-primary/30 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-medium group-hover:text-primary transition-colors">
                    Disponibilidad horaria
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configura tus horas libres para coordinar sesiones de estudio
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </button>

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 pb-8">
            <button
              type="button"
              onClick={() => navigate('/perfil')}
              className="h-12 px-6 border border-border rounded-lg hover:border-foreground/30 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="h-12 px-8 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>

      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((p) => ({ ...p, show: false }))}
        />
      )}
    </>
  );
}
