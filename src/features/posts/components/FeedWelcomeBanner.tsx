import { Link } from "react-router-dom";
import { BookOpen, Users, ArrowUpRight } from "lucide-react";

export function FeedWelcomeBanner() {
  return (
    <section className="welcome-banner">
      <div>
        <span className="eyebrow">EL CONOCIMIENTO SE COMPARTE</span>
        <h2>
          Tu siguiente idea
          <br />
          puede empezar aquí.
        </h2>
        <p>
          Conecta con estudiantes que están aprendiendo lo mismo que tú.
        </p>
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
        <span className="art-star">✳</span>
      </div>
    </section>
  );
}

