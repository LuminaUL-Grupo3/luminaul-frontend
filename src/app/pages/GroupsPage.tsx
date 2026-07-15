import { Users, Calendar, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';

interface GroupCardProps {
  id: string;
  course: string;
  admin: string;
  currentMembers: number;
  maxMembers: number;
  nextMeeting: string;
  tags: string[];
  membershipStatus?: 'none' | 'pending' | 'member';
}

function GroupCard({ id, course, admin, currentMembers, maxMembers, nextMeeting, tags, membershipStatus = 'none' }: GroupCardProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-border p-6 hover:border-primary/30 transition-all hover:shadow-md">
      <div className="mb-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold">{course}</h3>
          {membershipStatus === 'member' && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              Miembro
            </span>
          )}
          {membershipStatus === 'pending' && (
            <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
              Solicitud pendiente
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag) => (
            <span key={tag} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="w-4 h-4" />
          <span>Admin: {admin}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{currentMembers}/{maxMembers} integrantes</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{nextMeeting}</span>
        </div>
      </div>

      <button
        onClick={() => navigate(`/grupos/${id}`)}
        className="w-full flex items-center justify-center gap-2 h-11 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
      >
        Ver detalles
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export function GroupsPage() {
  const groups = [
    {
      id: '1',
      course: 'Estructuras de Datos I',
      admin: 'Lourdes Curahua',
      currentMembers: 5,
      maxMembers: 8,
      nextMeeting: 'Martes 7:00 PM',
      tags: ['#EstructurasDeDatos', '#GrupoDeEstudio'],
      membershipStatus: 'none' as const,
    },
    {
      id: '2',
      course: 'Matemáticas I',
      admin: 'Carlos Mendoza',
      currentMembers: 6,
      maxMembers: 10,
      nextMeeting: 'Lunes 6:00 PM',
      tags: ['#Matemáticas', '#Álgebra'],
      membershipStatus: 'member' as const,
    },
    {
      id: '3',
      course: 'Programación Básica',
      admin: 'Ana Pérez',
      currentMembers: 4,
      maxMembers: 8,
      nextMeeting: 'Miércoles 5:00 PM',
      tags: ['#Programación', '#Python'],
      membershipStatus: 'pending' as const,
    },
    {
      id: '4',
      course: 'Física General',
      admin: 'Roberto Silva',
      currentMembers: 7,
      maxMembers: 10,
      nextMeeting: 'Jueves 4:00 PM',
      tags: ['#Física', '#Mecánica'],
      membershipStatus: 'none' as const,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl mb-2">Grupos de Estudio</h1>
        <p className="text-muted-foreground">Descubre y únete a grupos de estudio de tus cursos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <GroupCard key={group.id} {...group} />
        ))}
      </div>
    </div>
  );
}
