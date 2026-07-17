import { User, GraduationCap } from 'lucide-react';

interface RequestCardProps {
  id: string;
  name: string;
  career: string;
  reason: string;
  profileImage?: string;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export function RequestCard({
  id,
  name,
  career,
  reason,
  profileImage,
  onAccept,
  onReject,
}: RequestCardProps) {
  return (
    <div className="bg-white rounded-xl border border-border p-6 hover:border-primary/30 transition-all">
      <div className="flex items-start gap-4">
        {/* Foto de perfil */}
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          {profileImage ? (
            <img
              src={profileImage}
              alt={name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-primary" />
          )}
        </div>

        {/* Información del solicitante */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold mb-1">{name}</h3>

          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <GraduationCap className="w-4 h-4" />
            <span className="text-sm">{career}</span>
          </div>

          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-1">Motivo:</p>
            <p className="text-foreground leading-relaxed">"{reason}"</p>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <button
              onClick={() => onAccept(id)}
              className="flex-1 h-11 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Aceptar
            </button>
            <button
              onClick={() => onReject(id)}
              className="flex-1 h-11 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Rechazar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
