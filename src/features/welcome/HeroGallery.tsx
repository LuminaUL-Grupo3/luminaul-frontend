import { useEffect, useState } from "react";
import { ArrowUpRight, Pause, Play } from "lucide-react";

const photos = [
  { src: "/media/campus-ulima.webp", width: 1860, height: 900,
    alt: "Edificio F1 y jardines del campus de la Universidad de Lima", label: "Campus · Universidad de Lima",
    source: "https://www.ulima.edu.pe/campus" },
  { src: "/media/estudio-en-comunidad.webp", width: 1536, height: 1024,
    alt: "Tres estudiantes comparten apuntes y aprenden juntos en un patio universitario", label: "Aprende en comunidad",
    source: undefined },
];

/** Alterna las dos fotos cada tres segundos; la navegación manual y el movimiento reducido detienen el avance. */
export function HeroGallery() {
  const [active, setActive] = useState(0), [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const photo = photos[active];

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const changed = () => setReduced(preference.matches);
    preference.addEventListener("change", changed);
    return () => preference.removeEventListener("change", changed);
  }, []);

  useEffect(() => {
    if (paused || reduced) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") setActive((value) => (value + 1) % photos.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [paused, reduced]);

  return <>
    <div className="welcome-image-frame welcome-gallery" role="region" aria-label="Fotografías de la presentación" aria-roledescription="carrusel">
      {photos.map((item, index) => <img key={item.src} src={item.src} width={item.width} height={item.height}
        alt={item.alt} aria-hidden={index !== active} className={index === active ? "is-active" : ""}
        fetchPriority={index === 0 ? "high" : "auto"} />)}
      {!reduced && <button className="welcome-gallery-pause" type="button"
        aria-label={paused ? "Reanudar presentación de fotos" : "Pausar presentación de fotos"}
        onClick={() => setPaused(!paused)}>{paused ? <Play size={15} /> : <Pause size={15} />}</button>}
      <div className="welcome-gallery-dots" aria-label="Elegir fotografía">
        {photos.map((item, index) => <button key={item.src} type="button" aria-label={`Ver foto: ${item.label}`}
          aria-pressed={active === index} onClick={() => { setActive(index); setPaused(true); }}><span /></button>)}
      </div>
    </div>
    <span className="welcome-image-caption"><i />{photo.source
      ? <a href={photo.source} target="_blank" rel="noreferrer">{photo.label}<ArrowUpRight size={12} /></a>
      : photo.label}</span>
  </>;
}
