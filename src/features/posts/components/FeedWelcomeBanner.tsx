import { Link } from "react-router-dom";
import { BookOpen, Users, ArrowUpRight } from "lucide-react";

export function FeedWelcomeBanner() {
  return (
    <section className="welcome-banner">
      <div>
        <span className="eyebrow">GRUPOS DE ESTUDIO</span>
        <h2>Aprende con tu comunidad</h2>
        <p>Encuentra un grupo para repasar y resolver dudas de tus cursos.</p>
        <Link to="/grupos">
          Explorar mis grupos <ArrowUpRight size={17} />
        </Link>
      </div>
      <div className="banner-art" aria-hidden="true">
        <div className="art-book">
          <BookOpen size={54} />
        </div>
        <div className="art-users">
          <Users size={34} />
        </div>
      </div>
    </section>
  );
}
