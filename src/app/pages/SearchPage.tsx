import { useState, useMemo } from 'react';
import { Search, SearchX } from 'lucide-react';
import { PostCard } from '../components/PostCard';
import { FilterPanel } from '../components/FilterPanel';

interface Post {
  id: string;
  author: string;
  postType: 'Asesoría' | 'Grupo de Estudio';
  course: string;
  studyGroup: string;
  cycle: string;
  description: string;
  timeAgo: string;
}

export function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedCycle, setSelectedCycle] = useState('');

  const allPosts: Post[] = [
    {
      id: '1',
      author: 'María González',
      postType: 'Asesoría',
      course: 'Matemáticas I',
      studyGroup: 'Turno mañana',
      cycle: '1',
      description: 'Ofrezco asesorías de Matemáticas I para preparación de exámenes.',
      timeAgo: 'Hace 2 horas',
    },
    {
      id: '2',
      author: 'Carlos Ramírez',
      postType: 'Grupo de Estudio',
      course: 'Física General',
      studyGroup: 'Turno tarde',
      cycle: '2',
      description: 'Buscamos más integrantes para grupo de estudio de Física General.',
      timeAgo: 'Hace 5 horas',
    },
    {
      id: '3',
      author: 'Ana Martínez',
      postType: 'Asesoría',
      course: 'Programación Básica',
      studyGroup: 'Virtual',
      cycle: '3',
      description: 'Asesorías online de programación en Python y Java.',
      timeAgo: 'Hace 1 día',
    },
    {
      id: '4',
      author: 'Luis Torres',
      postType: 'Grupo de Estudio',
      course: 'Cálculo Diferencial',
      studyGroup: 'Turno noche',
      cycle: '4',
      description: 'Grupo de estudio nocturno para Cálculo Diferencial.',
      timeAgo: 'Hace 2 días',
    },
  ];

  const filteredPosts = useMemo(() => {
    let filtered = allPosts;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        post =>
          post.description.toLowerCase().includes(query) ||
          post.course.toLowerCase().includes(query) ||
          post.author.toLowerCase().includes(query) ||
          post.studyGroup.toLowerCase().includes(query) ||
          `${post.cycle} ciclo`.includes(query)
      );
    }

    if (selectedType) {
      filtered = filtered.filter(post => post.postType === selectedType);
    }

    if (selectedCourse) {
      filtered = filtered.filter(post => post.course === selectedCourse);
    }

    if (selectedCycle) {
      filtered = filtered.filter(post => post.cycle === selectedCycle);
    }

    return filtered;
  }, [searchQuery, selectedType, selectedCourse, selectedCycle]);

  const handleClearFilters = () => {
    setSelectedType('');
    setSelectedCourse('');
    setSelectedCycle('');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedType !== '' ||
    selectedCourse !== '' ||
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
            placeholder="Buscar por curso, descripción, autor o ciclo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-white border border-input rounded-lg focus:border-primary focus:outline-none transition-colors text-base"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <FilterPanel
            selectedType={selectedType}
            selectedCourse={selectedCourse}
            selectedCycle={selectedCycle}
            onTypeChange={setSelectedType}
            onCourseChange={setSelectedCourse}
            onCycleChange={setSelectedCycle}
            onClearFilters={handleClearFilters}
          />
        </aside>

        <div className="lg:col-span-3">
          {hasActiveFilters && (
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredPosts.length}{' '}
                {filteredPosts.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </p>
            </div>
          )}

          {filteredPosts.length > 0 ? (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
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