import { Users, Calendar, Info, Settings as SettingsIcon, UserPlus } from 'lucide-react';

interface GroupInfoProps {
  groupName: string;
  memberCount: number;
  nextMeeting: string;
}

export function GroupInfo({ groupName, memberCount, nextMeeting }: GroupInfoProps) {
  return (
    <div className="bg-white rounded-xl border border-border p-6 sticky top-24">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{groupName}</h2>
          <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <SettingsIcon className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
          Grupo de Estudio
        </span>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Integrantes</p>
            <p className="font-medium">{memberCount} miembros</p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3 bg-secondary rounded-lg">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Próxima reunión</p>
            <p className="font-medium">{nextMeeting}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button className="w-full flex items-center justify-center gap-2 h-11 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <UserPlus className="w-5 h-5" />
          Invitar miembros
        </button>

        <button className="w-full flex items-center justify-center gap-2 h-11 border border-border rounded-lg hover:bg-secondary transition-colors">
          <Info className="w-5 h-5" />
          Ver detalles del grupo
        </button>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="text-sm font-medium mb-3">Miembros activos</h3>
        <div className="space-y-2">
          {['Lourdes Curahua', 'Sebastián Chapman', 'Gabriela Garay', 'María González'].map((member, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-foreground">{member}</span>
            </div>
          ))}
          <button className="text-sm text-primary hover:text-primary/80 transition-colors">
            Ver todos ({memberCount})
          </button>
        </div>
      </div>
    </div>
  );
}
