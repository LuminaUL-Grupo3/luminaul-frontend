import { User, GraduationCap, Shield, ExternalLink } from 'lucide-react';

interface MemberProfileCardProps {
  id: string;
  name: string;
  career: string;
  role?: 'admin' | 'member';
  onViewProfile: (id: string) => void;
}

export function MemberProfileCard({ id, name, career, role = 'member', onViewProfile }: MemberProfileCardProps) {
  const isAdmin = role === 'admin';

  return (
    <div className={`bg-white rounded-xl border-2 transition-all hover:shadow-lg ${
      isAdmin ? 'border-primary' : 'border-border hover:border-primary/30'
    }`}>
      <div className="p-6">
        {/* Avatar y badge admin */}
        <div className="flex flex-col items-center mb-4">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-3 ${
            isAdmin ? 'bg-primary' : 'bg-primary/10'
          }`}>
            <User className={`w-10 h-10 ${isAdmin ? 'text-white' : 'text-primary'}`} />
          </div>

          {isAdmin && (
            <div className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-medium flex items-center gap-1.5 mb-2">
              <Shield className="w-3.5 h-3.5" />
              Administrador
            </div>
          )}
        </div>

        {/* Información */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold mb-2">{name}</h3>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <GraduationCap className="w-4 h-4" />
            <span className="text-sm">{career}</span>
          </div>
        </div>

        {/* Botón */}
        <button
          onClick={() => onViewProfile(id)}
          className="w-full flex items-center justify-center gap-2 h-10 border border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors text-sm font-medium"
        >
          Ver perfil
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
