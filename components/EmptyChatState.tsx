import { MessageSquareOff, Users } from 'lucide-react';
import { useNavigate } from 'react-router';

export function EmptyChatState() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-full bg-gradient-to-br from-white to-secondary/20">
      <div className="text-center max-w-md px-8">
        <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageSquareOff className="w-12 h-12 text-muted-foreground" />
        </div>

        <h2 className="text-2xl mb-3">Aún no tienes conversaciones activas</h2>
        <p className="text-muted-foreground mb-8">
          Únete a grupos de estudio para comenzar a colaborar y chatear con tus compañeros de clase.
        </p>

        <button
          onClick={() => navigate('/grupos')}
          className="flex items-center justify-center gap-2 h-12 px-6 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors mx-auto"
        >
          <Users className="w-5 h-5" />
          Explorar grupos
        </button>

        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-sm font-medium mb-4">¿Qué puedes hacer aquí?</h3>
          <div className="space-y-3 text-left">
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-muted-foreground">
                Chatear en tiempo real con tus grupos de estudio
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-muted-foreground">
                Compartir archivos y material de estudio
              </p>
            </div>
            <div className="flex gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-muted-foreground">
                Coordinar reuniones y sesiones de estudio
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
