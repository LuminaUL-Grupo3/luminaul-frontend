import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Calendar, Users, User, CheckCircle2, Clock, LogOut, Settings, AlertCircle } from 'lucide-react';
import { LeaveGroupModal } from '../components/LeaveGroupModal';
import { Toast } from '../components/Toast';

interface GroupData {
  id: string;
  course: string;
  admin: string;
  currentMembers: number;
  maxMembers: number;
  nextMeeting: string;
  description: string;
  tags: string[];
  membershipStatus: 'none' | 'pending' | 'member' | 'full';
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

const GROUPS_DATA: Record<string, GroupData> = {
  '1': {
    id: '1',
    course: 'Estructuras de Datos I',
    admin: 'Lourdes Curahua',
    currentMembers: 5,
    maxMembers: 8,
    nextMeeting: 'Martes 7:00 PM',
    description: 'Grupo enfocado en resolver ejercicios, preparar prácticas y compartir material del curso.',
    tags: ['#EstructurasDeDatos', '#GrupoDeEstudio'],
    membershipStatus: 'none',
  },
  '2': {
    id: '2',
    course: 'Matemáticas I',
    admin: 'Carlos Mendoza',
    currentMembers: 6,
    maxMembers: 10,
    nextMeeting: 'Lunes 6:00 PM',
    description: 'Grupo de repaso y práctica de álgebra, cálculo y ejercicios del curso de Matemáticas I.',
    tags: ['#Matemáticas', '#Álgebra'],
    membershipStatus: 'member',
  },
  '3': {
    id: '3',
    course: 'Programación Básica',
    admin: 'Ana Pérez',
    currentMembers: 4,
    maxMembers: 8,
    nextMeeting: 'Miércoles 5:00 PM',
    description: 'Grupo para aprender los fundamentos de programación con Python y resolver ejercicios prácticos.',
    tags: ['#Programación', '#Python'],
    membershipStatus: 'pending',
  },
  '4': {
    id: '4',
    course: 'Física General',
    admin: 'Roberto Silva',
    currentMembers: 7,
    maxMembers: 10,
    nextMeeting: 'Jueves 4:00 PM',
    description: 'Grupo de estudio de mecánica clásica, cinemática y dinámica para el curso de Física General.',
    tags: ['#Física', '#Mecánica'],
    membershipStatus: 'none',
  },
};

const CURRENT_USER = 'Nombre del Estudiante'; // usuario logueado simulado

export function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const initialData = GROUPS_DATA[id || '1'] ?? GROUPS_DATA['1'];
  const [group, setGroup] = useState<GroupData>(initialData);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'success',
  });

  const handleRequestJoin = () => {
    setGroup({ ...group, membershipStatus: 'pending' });
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleLeaveGroup = () => {
    setShowLeaveModal(true);
  };

  const confirmLeaveGroup = () => {
    setShowLeaveModal(false);
    setToast({
      show: true,
      message: 'Has salido del grupo correctamente',
      type: 'success',
    });
    setTimeout(() => {
      navigate('/grupos');
    }, 2000);
  };

  const cancelLeaveGroup = () => {
    setShowLeaveModal(false);
  };

  const isAdmin = group.admin === CURRENT_USER;

  const renderActionButton = () => {
    if (group.membershipStatus === 'member') {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 h-14 px-8 bg-green-100 text-green-700 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-medium">Ya eres miembro</span>
          </div>

          {isAdmin && (
            <button
              onClick={() => navigate(`/grupos/${id}/administrar`)}
              className="w-full flex items-center justify-center gap-2 h-12 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <Settings className="w-5 h-5" />
              Administrar integrantes
            </button>
          )}

          <button
            onClick={handleLeaveGroup}
            className="w-full flex items-center justify-center gap-2 h-12 border-2 border-destructive text-destructive rounded-lg hover:bg-destructive hover:text-white transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Salir del grupo
          </button>
        </div>
      );
    }

    if (group.membershipStatus === 'full') {
      return (
        <div className="flex flex-col items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="w-4 h-4" />
            Grupo completo
          </span>
          <button
            disabled
            className="flex items-center justify-center gap-2 h-12 px-8 bg-secondary text-muted-foreground rounded-lg cursor-not-allowed font-medium"
          >
            No disponible
          </button>
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            Este grupo alcanzó el número máximo de integrantes.
          </p>
        </div>
      );
    }

    if (group.membershipStatus === 'pending') {
      return (
        <div className="flex flex-col items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border bg-amber-50 text-amber-700 border-amber-200">
            <Clock className="w-4 h-4" />
            Solicitud pendiente
          </span>
          <button
            disabled
            className="flex items-center justify-center gap-2 h-12 px-8 bg-secondary text-muted-foreground rounded-lg cursor-not-allowed font-medium"
          >
            <CheckCircle2 className="w-5 h-5" />
            Solicitud enviada
          </button>
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            Tu solicitud está siendo revisada por el administrador del grupo.
          </p>
        </div>
      );
    }

    // Estado 'none': no pertenece al grupo
    return (
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handleRequestJoin}
          className="flex items-center justify-center gap-2 h-12 px-8 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Enviar solicitud
        </button>
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          Envía una solicitud al administrador para unirte a este grupo de estudio.
        </p>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Volver
      </button>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        {/* Header del grupo */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 border-b border-border">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm mb-3">
                Grupo de Estudio
              </span>
              <h1 className="text-4xl mb-2">{group.course}</h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {group.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-white border border-border text-foreground rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-8">
          {/* Información del grupo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Administrador</p>
                <p className="font-medium">{group.admin}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Integrantes</p>
                <p className="font-medium">
                  {group.currentMembers}/{group.maxMembers}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Próxima reunión</p>
                <p className="font-medium">{group.nextMeeting}</p>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="mb-8">
            <h2 className="text-xl mb-3">Descripción</h2>
            <p className="text-foreground leading-relaxed">{group.description}</p>
          </div>

          {/* Botón de acción */}
          <div className="flex justify-center pt-6 border-t border-border">
            {renderActionButton()}
          </div>

          {/* Lista de integrantes (solo visible para miembros) */}
          {group.membershipStatus === 'member' && (
            <div className="mt-8 pt-8 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl">Integrantes del grupo</h2>
                <button
                  onClick={() => navigate(`/grupos/${id}/integrantes`)}
                  className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Ver todos (8)
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Lourdes Curahua', 'Sebastián Garate', 'Gabriela Garay', 'Jim', 'María González'].slice(0, 5).map((member, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-secondary rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member}</p>
                      {index === 0 && (
                        <p className="text-xs text-muted-foreground">Admin</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <h3 className="text-lg mb-3 text-blue-900">Beneficios de unirte</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex gap-2">
              <span>•</span>
              <span>Estudia con compañeros del mismo curso</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Comparte y recibe material de estudio</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Resuelve dudas en grupo</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Prepárate mejor para los exámenes</span>
            </li>
          </ul>
        </div>

        <div className="bg-orange-50 rounded-xl border border-orange-200 p-6">
          <h3 className="text-lg mb-3 text-orange-900">Requisitos</h3>
          <ul className="space-y-2 text-orange-800">
            <li className="flex gap-2">
              <span>•</span>
              <span>Estar inscrito en el curso</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Compromiso con las reuniones</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Participación activa en las sesiones</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>Respetar las normas del grupo</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Modal de éxito */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-xl border border-border p-8 max-w-md w-full mx-4 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl mb-2">Solicitud enviada con éxito</h2>
            <p className="text-muted-foreground">
              El administrador del grupo revisará tu solicitud y te notificará pronto.
            </p>
          </div>
        </div>
      )}

      {/* Modal de salir del grupo */}
      <LeaveGroupModal
        isOpen={showLeaveModal}
        groupName={group.course}
        onConfirm={confirmLeaveGroup}
        onCancel={cancelLeaveGroup}
      />

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
