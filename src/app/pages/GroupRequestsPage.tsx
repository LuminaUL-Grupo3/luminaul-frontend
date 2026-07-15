import { useState } from 'react';
import { RequestCard } from '../components/RequestCard';
import { Toast } from '../components/Toast';
import { InboxIcon } from 'lucide-react';

interface Request {
  id: string;
  name: string;
  career: string;
  reason: string;
  profileImage?: string;
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export function GroupRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([
    {
      id: '1',
      name: 'Sebastián Chapman',
      career: 'Ingeniería de Sistemas',
      reason: 'Quiero reforzar mis conocimientos para el examen parcial.',
    },
    {
      id: '2',
      name: 'Gabriela Garay',
      career: 'Ingeniería de Sistemas',
      reason: 'Busco un grupo para practicar ejercicios.',
    },
  ]);

  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'success',
  });

  const handleAccept = (id: string) => {
    setRequests(requests.filter(req => req.id !== id));
    setToast({
      show: true,
      message: 'Solicitud aceptada',
      type: 'success',
    });
  };

  const handleReject = (id: string) => {
    setRequests(requests.filter(req => req.id !== id));
    setToast({
      show: true,
      message: 'Solicitud rechazada',
      type: 'error',
    });
  };

  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Solicitudes de unión</h1>
        <p className="text-muted-foreground">
          Gestiona quiénes pueden ingresar a tu grupo de estudio
        </p>
      </div>

      {/* Lista de solicitudes */}
      {requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((request) => (
            <RequestCard
              key={request.id}
              {...request}
              onAccept={handleAccept}
              onReject={handleReject}
            />
          ))}
        </div>
      ) : (
        // Estado vacío
        <div className="bg-white rounded-xl border border-border p-16 text-center">
          <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <InboxIcon className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-2xl mb-2">No hay solicitudes pendientes por revisar</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Cuando los estudiantes soliciten unirse a tu grupo, aparecerán aquí para que puedas aprobarlas o rechazarlas.
          </p>
        </div>
      )}

      {/* Toast notifications */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  );
}
