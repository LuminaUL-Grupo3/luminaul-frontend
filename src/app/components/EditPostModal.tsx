import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getCourses } from './CourseController';
import type { Course } from './CourseService';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    course: string;
    studyGroup: string;
    description: string;
  };
  onSave: (data: FormData) => void;
}

interface FormData {
  course: string;
  studyGroup: string;
  description: string;
}

export function EditPostModal({ isOpen, onClose, post, onSave }: EditPostModalProps) {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);

  const { register, handleSubmit, formState: { errors, isDirty }, reset, watch } = useForm<FormData>({
    defaultValues: {
      course: post.course,
      studyGroup: post.studyGroup,
      description: post.description,
    }
  });

  useEffect(() => {
    const subscription = watch(() => setHasChanges(isDirty));
    return () => subscription.unsubscribe();
  }, [watch, isDirty]);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    getCourses()
      .then((data) => {
        if (active) setCourses(data);
      })
      .catch((err) => {
        console.error('Error al cargar cursos en modal:', err);
      })
      .finally(() => {
        if (active) setIsLoadingCourses(false);
      });
    return () => {
      active = false;
    };
  }, [isOpen]);

  const onSubmit = (data: FormData) => {
    onSave(data);
    setShowSuccess(true);
    setHasChanges(false);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    if (hasChanges) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    reset();
    setHasChanges(false);
    onClose();
  };

  const cancelExit = () => {
    setShowExitConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl border border-border max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {showSuccess ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl mb-2">Cambios guardados exitosamente</h2>
            <p className="text-muted-foreground">Tu publicación ha sido actualizada correctamente.</p>
          </div>
        ) : showExitConfirm ? (
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl mb-2">¿Desea guardar los cambios?</h2>
              <p className="text-muted-foreground">Tienes cambios sin guardar. Si sales ahora, se perderán.</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleSubmit(onSubmit)}
                className="flex-1 h-12 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Guardar y salir
              </button>
              <button
                onClick={confirmExit}
                className="flex-1 h-12 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted transition-colors"
              >
                Salir sin guardar
              </button>
              <button
                onClick={cancelExit}
                className="px-6 h-12 border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-2xl">Editar Publicación</h2>
              <button
                onClick={handleClose}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
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
                  placeholder="Describe tu publicación..."
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
                  onClick={handleClose}
                  className="px-8 h-12 bg-secondary text-secondary-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  Regresar
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
