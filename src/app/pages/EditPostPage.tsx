import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router';
import { AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { getCourses } from '../components/CourseController';
import type { Course } from '../components/CourseService';

interface FormData {
  postType: string;
  course: string;
  studyGroup: string;
  description: string;
}

export function EditPostPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const post = location.state?.post;

  const [showSuccess, setShowSuccess] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  const { register, handleSubmit, formState: { errors, isDirty }, reset, watch } = useForm<FormData>({
    defaultValues: {
      postType: post?.postType === 'Asesoría' ? 'asesoria' : 'grupo',
      course: post?.course || '',
      studyGroup: post?.studyGroup || '',
      description: post?.description || '',
    }
  });

  useEffect(() => {
    if (!post) {
      navigate('/mis-publicaciones');
    }
  }, [post, navigate]);

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

  const onSubmit = (data: FormData) => {
    console.log('Guardando cambios:', data);
    setShowSuccess(true);
    setHasChanges(false);
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/mis-publicaciones');
    }, 2000);
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
    handleSubmit(onSubmit)();
  };

  if (!post) {
    return null;
  }

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
              disabled={isLoadingCourses}
            >
              <option value="">
                {isLoadingCourses ? 'Cargando cursos...' : 'Selecciona un curso'}
              </option>
              {courses.map((course) => (
                <option key={course.id} value={course.name}>
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

          <div>
            <label className="block mb-2">Grupo de estudio</label>
            <select
              {...register('studyGroup', { required: 'Debe seleccionar un grupo de estudio' })}
              className="w-full h-12 px-4 bg-white border border-input rounded-lg focus:border-primary focus:outline-none transition-colors"
            >
              <option value="">Selecciona un grupo</option>
              <option value="Grupo A - Mañana">Grupo A - Mañana</option>
              <option value="Grupo B - Tarde">Grupo B - Tarde</option>
              <option value="Grupo C - Noche">Grupo C - Noche</option>
              <option value="Grupo Virtual">Grupo Virtual</option>
            </select>
            {errors.studyGroup && (
              <div className="flex items-center gap-2 mt-2 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{errors.studyGroup.message}</span>
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
              className="flex-1 h-12 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Guardar cambios
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
