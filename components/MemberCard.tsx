import { User, GraduationCap, Shield } from 'lucide-react';

interface MemberCardProps {
  id: string;
  name: string;
  career: string;
  isAdmin: boolean;
  isCurrentUser: boolean;
  onRemove: (id: string, name: string) => void;
}

export function MemberCard({ id, name, career, isAdmin, isCurrentUser, onRemove }: MemberCardProps) {
  return (
    <div className="bg-white rounded-xl border border-border p-5 hover:border-primary/30 transition-all">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-8 h-8 text-primary" />
        </div>

        {/* Información */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold truncate">{name}</h3>
            {isAdmin && (
              <div className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Admin
              </div>
            )}
            {isCurrentUser && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                Tú
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-muted-foreground mb-4">
            <GraduationCap className="w-4 h-4" />
            <span className="text-sm">{career}</span>
          </div>

          {/* Botón de expulsar */}
          {!isCurrentUser && !isAdmin && (
            <button
              onClick={() => onRemove(id, name)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-destructive text-destructive rounded-lg hover:bg-destructive hover:text-white transition-colors text-sm font-medium"
            >
              <User className="w-4 h-4" />
              Expulsar
            </button>
          )}

          {isCurrentUser && (
            <p className="text-sm text-muted-foreground italic">
              No puedes expulsarte a ti mismo del grupo
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
