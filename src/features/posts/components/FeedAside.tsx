import { Link } from "react-router-dom";
import { Sparkles, Users, MessageSquare } from "lucide-react";

export function FeedAside() {
  return (
    <aside className="feed-aside">
      <div className="panel aside-card">
        <h3>
          <Sparkles size={18} />
          ¿Cómo aprovechar el feed?
        </h3>
        <p className="muted small">
          Encuentra compañeros de estudio para tus cursos del ciclo o comparte lo que sabes creando un grupo de estudio o asesoría.
        </p>
        <div className="aside-actions">
          <Link to="/publicar" className="button secondary full">
            Crear publicación
          </Link>
          <Link to="/grupos" className="text-button">
            <Users size={16} /> Mis grupos
          </Link>
          <Link to="/mensajes" className="text-button">
            <MessageSquare size={16} /> Mensajes
          </Link>
        </div>
      </div>
      <div className="panel aside-tips">
        <h4>Consejos para grupos</h4>
        <ul className="tips-list">
          <li>Sé específico con los temas que quieren repasar.</li>
          <li>Indica los días u horarios sugeridos de reunión.</li>
          <li>Revisa las solicitudes para mantener un grupo activo.</li>
        </ul>
      </div>
    </aside>
  );
}
