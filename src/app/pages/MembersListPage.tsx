import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Users, Search, Shield } from 'lucide-react';
import { MemberProfileCard } from '../components/MemberProfileCard';

interface Member {
  id: string;
  name: string;
  career: string;
  role: 'admin' | 'member';
}

export function MembersListPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const groupName = 'Estructuras de Datos I';

  const members: Member[] = [
    {
      id: '1',
      name: 'Lourdes Curahua',
      career: 'Ingeniería de Sistemas',
      role: 'admin',
    },
    {
      id: '2',
      name: 'Sebastián Garate',
      career: 'Ingeniería de Sistemas',
      role: 'member',
    },
    {
      id: '3',
      name: 'Gabriela Garay',
      career: 'Ingeniería Industrial',
      role: 'member',
    },
    {
      id: '4',
      name: 'Jim',
      career: 'Ingeniería de Sistemas',
      role: 'member',
    },
    {
      id: '5',
      name: 'María González',
      career: 'Ingeniería de Software',
      role: 'member',
    },
    {
      id: '6',
      name: 'Carlos Ramírez',
      career: 'Ingeniería Electrónica',
      role: 'member',
    },
    {
      id: '7',
      name: 'Ana Martínez',
      career: 'Ingeniería de Sistemas',
      role: 'member',
    },
    {
      id: '8',
      name: 'Roberto Silva',
      career: 'Ingeniería Mecánica',
      role: 'member',
    },
  ];

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.career.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const adminCount = members.filter(m => m.role === 'admin').length;
  const regularMembers = members.filter(m => m.role === 'member').length;

  const handleViewProfile = (memberId: string) => {
    navigate(`/perfil/${memberId}`);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <button
        onClick={() => navigate(`/grupos/${id}`)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver al grupo
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Integrantes del grupo</h1>
        <p className="text-xl text-muted-foreground">{groupName}</p>
      </div>

      {/* Estadísticas y búsqueda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Total */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total de miembros</p>
              <p className="text-3xl font-semibold">{members.length}</p>
            </div>
          </div>
        </div>

        {/* Administradores */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Administradores</p>
              <p className="text-3xl font-semibold">{adminCount}</p>
            </div>
          </div>
        </div>

        {/* Buscador */}
        <div className="bg-white rounded-xl border border-border p-6">
          <label className="block text-sm text-muted-foreground mb-2">Buscar integrante</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Nombre o carrera..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-secondary rounded-lg border border-transparent focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Contador de resultados */}
      {searchQuery && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredMembers.length} {filteredMembers.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
          </p>
        </div>
      )}

      {/* Grid de miembros */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMembers.map((member) => (
            <MemberProfileCard
              key={member.id}
              {...member}
              onViewProfile={handleViewProfile}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-border">
          <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl mb-2">No se encontraron integrantes</h3>
          <p className="text-muted-foreground">
            Intenta con otros términos de búsqueda
          </p>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-8 bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-lg mb-3 text-blue-900">Sobre este grupo</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800 text-sm">
          <div className="flex gap-2">
            <span>•</span>
            <span>Los administradores están identificados con un badge especial</span>
          </div>
          <div className="flex gap-2">
            <span>•</span>
            <span>Puedes ver el perfil completo de cada integrante</span>
          </div>
          <div className="flex gap-2">
            <span>•</span>
            <span>Usa el buscador para encontrar compañeros rápidamente</span>
          </div>
          <div className="flex gap-2">
            <span>•</span>
            <span>Actualmente hay {members.length} miembros activos en el grupo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
