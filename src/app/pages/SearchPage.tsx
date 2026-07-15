import { useMemo } from 'react';
import { Search, SearchX, Loader2, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { PostCard } from '../components/PostCard';
import { FilterPanel } from '../components/FilterPanel';
import { useCourses } from '../../hooks/useCourses';
import { usePublications } from '../../hooks/usePublications';
import { formatTimeAgo } from '../../utils/formatTimeAgo';
import type { PublicationType } from '../../types/publication';

type TypeValue = '' | PublicationType;

export function SearchPage() {
  // Los filtros viven en la URL del navegador (?type=&course_id=&cycle=&q=), así
  // el enlace es compartible, sobrevive a un F5 y funciona con el botón "atrás".
  // Además cumple literalmente la tarea: "enviar los parámetros a través de la URL".
  const [searchParams, setSearchParams] = useSearchParams();

  const rawType = searchParams.get('type');
  const selectedType: TypeValue =
    rawType === 'study_group' || rawType === 'tutoring' ? rawType : '';
  const selectedCourseId = searchParams.get('course_id') ?? '';
  const selectedCycle = searchParams.get('cycle') ?? '';
  const searchQuery = searchParams.get('q') ?? '';

  // Escribe/borra un parámetro en la URL sin apilar historial (replace).
  const setParam = (key: string, value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  };

  const { courses } = useCourses();
  const { publications, loading, error, reload } = usePublications({
    type: selectedType || undefined,
    course_id: selectedCourseId || undefined,
  });

  // El tipo y el curso viajan como parámetros al GET /publications. El ciclo y el
  // texto libre se refinan en cliente porque el contrato del feed solo acepta
  // type y course_id como filtros de servidor.
  const posts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return publications
      .filter((p) => !selectedCycle || String(p.course.cycle) === selectedCycle)
      .filter((p) => {
        if (!query) return true;
        return (
          p.description.toLowerCase().includes(query) ||
          p.course.name.toLowerCase().includes(query) ||
          p.author.name.toLowerCase().includes(query)
        );
      })
      .map((p) => ({
        id: p.id,
        author: p.author.name,
        postType: (p.type === 'study_group' ? 'Grupo de Estudio' : 'Asesoría') as
          | 'Grupo de Estudio'
          | 'Asesoría',
        course: p.course.name,
        studyGroup: `${p.course.cycle}° ciclo`,
        description: p.description,
        timeAgo: formatTimeAgo(p.created_at),
      }));
  }, [publications, selectedCycle, searchQuery]);

  const handleCycleChange = (cycle: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (cycle) next.set('cycle', cycle);
        else next.delete('cycle');
        // Si el curso elegido no pertenece al nuevo ciclo, lo limpiamos.
        const courseId = next.get('course_id');
        if (cycle && courseId) {
          const course = courses.find((c) => c.id === courseId);
          if (course && String(course.cycle) !== cycle) next.delete('course_id');
        }
        return next;
      },
      { replace: true },
    );
  };

  const handleClearFilters = () => {
    setSearchParams({}, { replace: true });
  };

  const hasActiveFilters =
    selectedType !== '' ||
    selectedCourseId !== '' ||
    selectedCycle !== '' ||
    searchQuery !== '';

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Buscar Publicaciones</h1>
        <p className="text-muted-foreground">
          Encuentra asesorías y grupos de estudio que se adapten a tus necesidades
        </p>
      </div>

      <div className="mb-6">
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por curso, descripción o autor..."
            value={searchQuery}
            onChange={(e) => setParam('q', e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-white border border-input rounded-lg focus:border-primary focus:outline-none transition-colors text-base"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <FilterPanel
            courses={courses}
            selectedType={selectedType}
            selectedCourseId={selectedCourseId}
            selectedCycle={selectedCycle}
            onTypeChange={(type) => setParam('type', type)}
            onCourseChange={(courseId) => setParam('course_id', courseId)}
            onCycleChange={handleCycleChange}
            onClearFilters={handleClearFilters}
          />
        </aside>

        <div className="lg:col-span-3">
          {!loading && !error && hasActiveFilters && (
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {posts.length}{' '}
                {posts.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </p>
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-xl border border-border p-12 text-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Cargando publicaciones...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl border border-border p-12 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl mb-2">No se pudieron cargar las publicaciones</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <button
                onClick={reload}
                className="h-12 px-6 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} {...post} isOwn={false} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-border p-12 text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchX className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl mb-2">No se encontraron resultados para tu búsqueda</h3>
              <p className="text-muted-foreground mb-6">
                Intenta ajustar los filtros o buscar con otros términos
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="h-12 px-6 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Limpiar todos los filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
