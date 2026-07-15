import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Users, Settings } from 'lucide-react';
import { MemberCard } from '../components/MemberCard';
import { RemoveMemberModal } from '../components/RemoveMemberModal';
import { Toast } from '../components/Toast';

interface Member {
  id: string;
  name: string;
  career: string;
  isAdmin: boolean;
  isCurrentUser: boolean;
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export function ManageMembersPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [groupName] = useState('Estructuras de Datos I');
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: string; name: string } | null>(null);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'success',
  });

  const [members, setMembers] = useState<Member[]>([
    {
      id: '1',
      name: 'Lourdes Curahua',
      career: 'Ingeniería de Sistemas',
      isAdmin: true,
      isCurrentUser: true,
    },
    {
      id: '2',
      name: 'Sebastián Garate',
      career: 'Ingeniería de Sistemas',
      isAdmin: false,
      isCurrentUser: false,
    },
    {
      id: '3',
      name: 'Gabriela Garay',
      career: 'Ingeniería Industrial',
      isAdmin: false,
      isCurrentUser: false,
    },
    {
      id: '4',
      name: 'Jim',
      career: 'Ingeniería de Sistemas',
      isAdmin: false,
      isCurrentUser: false,
    },
    {
      id: '5',
      name: 'María González',
      career: 'Ingeniería de Software',
      isAdmin: false,
      isCurrentUser: false,
    },
  ]);

  const handleRemoveMember = (memberId: string, memberName: string) => {
    setMemberToRemove({ id: memberId, name: memberName });
    setShowRemoveModal(true);
  };

  const confirmRemoveMember = () => {
    if (memberToRemove) {
      setMembers(members.filter(m => m.id !== memberToRemove.id));
      setShowRemoveModal(false);
      setToast({
        show: true,
        message: `${memberToRemove.name} ha sido expulsado del grupo`,
        type: 'success',
      });
      setMemberToRemove(null);
    }
  };

  const cancelRemoveMember = () => {
    setShowRemoveModal(false);
    setMemberToRemove(null);
  };

  const adminCount = members.filter(m => m.isAdmin).length;
  const regularMembers = members.filter(m => !m.isAdmin).length;

  return (
    <div className="max-w-5xl mx-auto">
      <button
        onClick={() => navigate(`/grupos/${id}`)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver al grupo
      </button>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl">Administrar integrantes</h1>
            <p className="text-muted-foreground">{groupName}</p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de miembros</p>
              <p className="text-2xl font-semibold">{members.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Administradores</p>
              <p className="text-2xl font-semibold">{adminCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Miembros regulares</p>
              <p className="text-2xl font-semibold">{regularMembers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de miembros */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Integrantes del grupo</h2>
          <span className="text-sm text-muted-foreground">
            {members.length} {members.length === 1 ? 'miembro' : 'miembros'}
          </span>
        </div>

        {members.map((member) => (
          <MemberCard
            key={member.id}
            {...member}
            onRemove={handleRemoveMember}
          />
        ))}
      </div>

      {/* Información adicional */}
      <div className="mt-8 bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h3 className="text-lg mb-3 text-blue-900">Gestión de integrantes</h3>
        <ul className="space-y-2 text-blue-800 text-sm">
          <li className="flex gap-2">
            <span>•</span>
            <span>Como administrador, puedes expulsar miembros del grupo cuando sea necesario</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Los usuarios expulsados deberán solicitar unirse nuevamente</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>No puedes expulsarte a ti mismo ni a otros administradores</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Esta acción es permanente y se notificará al usuario afectado</span>
          </li>
        </ul>
      </div>

      {/* Modal de expulsar miembro */}
      {memberToRemove && (
        <RemoveMemberModal
          isOpen={showRemoveModal}
          memberName={memberToRemove.name}
          onConfirm={confirmRemoveMember}
          onCancel={cancelRemoveMember}
        />
      )}

      {/* Toast de confirmación */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
}
