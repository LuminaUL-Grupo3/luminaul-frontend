import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import {
  loadPostForEdit,
  savePost,
  apiTypeToFormType,
} from '../components/PostController';
import { getCourses, type Course } from '../components/CourseService';

interface FormData {
  postType: string;
  course: string; // course_id (uuid)
  description: string;
}

export function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  const { register, handleSubmit, formState: { errors, isDirty }, reset, watch } = useForm<FormData>({
    defaultValues: {
      postType: '',
      course: '',
      description: '',
    }
  });

  // Precarga: GET /api/v1/posts/:id + GET /api/v1/courses (H.U 1.2)
  useEffect(() => {
    if (!id) {
      setLoadError('Publicación no encontrada.');
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchData() {
      try {
        setIsLoading(true);
        setLoadError(null);

        const [post, courseList] = await Promise.all([
          loadPostForEdit(id!),
          getCourses(),
        ]);

        if (cancelled) return;

        setCourses(courseList);
        reset({
          postType: apiTypeToFormType(post.type),
          course: post.course_id,
          description: post.description,
        });
      } catch (error) {
        if (cancelled) return;
        setLoadError(
          error instanceof Error
            ? error.message
            : 'No se pudo cargar la publicación. Verifica que el backend esté encendido.'
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [id, reset]);

  useEffect(() => {
    let active = true;
    getCourses()
      .then((data) => {
        if (active) setCourses(data);
      })
      .catch((err) => {
        console.error('Error al cargar cursos:', err);
      })
      .finally(() => {
        if (active) setIsLoadingCourses(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const subscription = watch(() => setHasChanges(isDirty));
    return () => subscription.unsubscribe();
  }, [watch, isDirty]);

  // PUT /api/v1/posts/:id (H.U 1.2)
  const onSubmit = async (data: FormData) => {
    if (!id) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await savePost(id, data);
      setShowSuccess(true);
      setHasChanges(false);
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/mis-publicaciones');
      }, 2000);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Ocurrió un error inesperado.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (hasChanges) {
      setShowExitConfirm(true);
    } else {
      navigate('/mis-publicaciones');
    }
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    reset();
    setHasChanges(false);
    navigate('/mis-publicaciones');
  };

  const saveAndExit = () => {
    setShowExitConfirm(false);
    handleSubmit(onSubmit)();
  };

  if (showSuccess) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="bg-white rounded-xl border border-border p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl mb-2">Post modificado con éxito</h2>
          <p className="text-muted-foreground">Los cambios han sido guardados correctamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver a Mis publicaciones
      </button>

      <div className="bg-white rounded-xl border border-border p-8">
        <h1 className="text-3xl mb-2">Editar Publicación</h1>
        <p className="text-muted-foreground mb-8">Modifica los detalles de tu publicación.</p>

        {isLoading && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Cargando datos de la publicación...</p>
          </div>
        )}

        {!isLoading && loadError && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <p className="text-destructive mb-4">{loadError}</p>
            <button
              onClick={() => navigate('/mis-publicaciones')}
              className="px-6 h-12 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted transition-colors"
            >
              Volver a Mis publicaciones
            </button>
          </div>
        )}

        {!isLoading && !loadError && (
          <>
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
                  {...register('postType', { required: 'Debe seleccionar un tipo de publicación' })}
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
                <label className="block mb-2">Curso</label>
                <select
                  {...register('course', { required: 'Debe seleccionar un curso' })}
                  className="w-full h-12 px-4 bg-white border border-input rounded-lg focus:border-primary focus:outline-none transition-colors"
                >
                  <option value="">Selecciona un curso</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.cycle != null ? `Ciclo ${course.cycle} — ${course.name}` : course.name}
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

              <div>
                <label className="block mb-2">Descripción</label>
                <textarea
                  {...register('description', {
                    required: 'La descripción es requerida',
                    minLength: { value: 20, message: 'La descripción debe tener al menos 20 caracteres' }
                  })}
                  rows={6}
                  placeholder="Describe tu publicación, incluye detalles sobre horarios, modalidad, temas a tratar..."
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
                  {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-8 h-12 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  Regresar
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl border border-border max-w-md w-full mx-4 p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl mb-2">¿Desea guardar los cambios?</h2>
              <p className="text-muted-foreground">Tienes cambios sin guardar. Si sales ahora, se perderán.</p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={saveAndExit}
                className="w-full h-12 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Guardar y salir
              </button>
              <button
                onClick={confirmExit}
                className="w-full h-12 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted transition-colors"
              >
                Salir sin guardar
              </button>
              <button
                onClick={() => setShowExitConfirm(false)}
                className="w-full h-12 border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
