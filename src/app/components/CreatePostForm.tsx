import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { createPost } from './PostController';
import { env } from '../../config/env';

interface FormData {
  postType: string;
  cycle: string;
  course: string; // ahora guarda el course_id (uuid) que exige el backend
  modality: string;
  shift: string;
  description: string;
}

interface Course {
  id: string;
  name: string;
  cycle: number | null;
}


const API_BASE_URL = env.apiUrl;

export function CreatePostForm() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FormData>();

  const selectedCycle = watch('cycle');

  
  const availableCourses = selectedCycle
    ? courses.filter((c) => String(c.cycle) === selectedCycle)
    : [];

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch(`${API_BASE_URL}/courses`);
        if (!response.ok) throw new Error();
        setCourses(await response.json());
      } catch {
        setCoursesError('No se pudieron cargar los cursos. Intenta recargar la página.');
      } finally {
        setIsLoadingCourses(false);
      }
    }
    fetchCourses();
  }, []);

 
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await createPost(data);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        reset();
      }, 3000);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Ocurrió un error inesperado.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onCancel = () => {
    reset();
  };

  if (showSuccess) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="bg-white rounded-xl border border-border p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl mb-2">¡Publicación enviada con éxito!</h2>
          <p className="text-muted-foreground">
            Tu publicación ha sido creada y está visible para la comunidad.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl border border-border p-8">
        <h1 className="text-3xl mb-2">Crear Publicación</h1>
        <p className="text-muted-foreground mb-8">
          Comparte una asesoría o crea un grupo de estudio para tu comunidad universitaria.
        </p>

        {coursesError && (
          <div className="flex items-center gap-2 mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{coursesError}</span>
          </div>
        )}

        {submitError && (
          <div className="flex items-center gap-2 mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block mb-2">Tipo de publicación</label>
            <select
              {...register('postType', { required: 'Debe seleccionar el tipo de la publicación' })}
              className="w-full h-12 px-4 bg-white border border-input rounded-lg focus:border-primary focus:outline-none transition-colors"
            >
              <option value="">Selecciona una opción</option>
              <option value="asesoria">Asesoría</option>
              <option value="grupo">Grupo de Estudio</option>
            </select>
            {errors.postType && (
              <div className="flex items-center gap-2 mt-2 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.postType.message}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block mb-2">Ciclo académico</label>
            <select
              {...register('cycle', { required: 'Debe seleccionar un ciclo académico' })}
              onChange={(e) => {
                setValue('cycle', e.target.value);
                setValue('course', '');
              }}
              className="w-full h-12 px-4 bg-white border border-input rounded-lg focus:border-primary focus:outline-none transition-colors"
            >
              <option value="">Selecciona un ciclo</option>
              <option value="1">1er ciclo</option>
              <option value="2">2do ciclo</option>
              <option value="3">3er ciclo</option>
              <option value="4">4to ciclo</option>
              <option value="5">5to ciclo</option>
              <option value="6">6to ciclo</option>
              <option value="7">7mo ciclo</option>
              <option value="8">8vo ciclo</option>
              <option value="9">9no ciclo</option>
              <option value="10">10mo ciclo</option>
            </select>
            {errors.cycle && (
              <div className="flex items-center gap-2 mt-2 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.cycle.message}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block mb-2">Curso</label>
            <select
              {...register('course', { required: 'Debe seleccionar curso' })}
              disabled={!selectedCycle || isLoadingCourses}
              className="w-full h-12 px-4 bg-white border border-input rounded-lg focus:border-primary focus:outline-none transition-colors disabled:bg-muted disabled:text-muted-foreground"
            >
              <option value="">
                {isLoadingCourses
                  ? 'Cargando cursos...'
                  : selectedCycle
                    ? 'Selecciona un curso'
                    : 'Primero selecciona un ciclo'}
              </option>
              {availableCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
            {errors.course && (
              <div className="flex items-center gap-2 mt-2 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.course.message}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2">Modalidad</label>
              <select
                {...register('modality', { required: 'Debe seleccionar una modalidad' })}
                className="w-full h-12 px-4 bg-white border border-input rounded-lg focus:border-primary focus:outline-none transition-colors"
              >
                <option value="">Selecciona una modalidad</option>
                <option value="presencial">Presencial</option>
                <option value="virtual">Virtual</option>
              </select>
              {errors.modality && (
                <div className="flex items-center gap-2 mt-2 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.modality.message}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block mb-2">Turno</label>
              <select
                {...register('shift', { required: 'Debe seleccionar un turno' })}
                className="w-full h-12 px-4 bg-white border border-input rounded-lg focus:border-primary focus:outline-none transition-colors"
              >
                <option value="">Selecciona un turno</option>
                <option value="manana">Turno mañana</option>
                <option value="tarde">Turno tarde</option>
                <option value="noche">Turno noche</option>
              </select>
              {errors.shift && (
                <div className="flex items-center gap-2 mt-2 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{errors.shift.message}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block mb-2">Descripción</label>
            <textarea
              {...register('description', {
                required: 'La descripción es requerida',
                minLength: { value: 20, message: 'La descripción debe tener al menos 20 caracteres' },
              })}
              rows={6}
              placeholder="Describe tu publicación, incluye detalles sobre ciclo, curso, modalidad, turno y temas a tratar..."
              className="w-full px-4 py-3 bg-white border border-input rounded-lg focus:border-primary focus:outline-none transition-colors resize-none"
            />
            {errors.description && (
              <div className="flex items-center gap-2 mt-2 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.description.message}</span>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? 'Publicando...' : 'Publicar'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-8 h-12 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-lg mb-2 text-blue-900">Consejos para una buena publicación</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex gap-2">
            <span>•</span>
            <span>Selecciona el ciclo para mostrar solo los cursos correspondientes.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Indica claramente la modalidad y el turno de la asesoría o grupo de estudio.</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Menciona el nivel de conocimiento requerido y los temas que se tratarán.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}