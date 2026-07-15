interface PlaceholderPageProps {
  title: string;
}

// Marcador temporal para las rutas cuyas pantallas aún no integra el equipo.
// Permite que el cascarón (Navbar + AppSidebar) navegue sin romperse hasta que
// cada integrante conecte su pantalla del export de Figma.
export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl border border-border p-12 text-center">
        <h1 className="text-3xl mb-2">{title}</h1>
        <p className="text-muted-foreground">
          Esta sección aún está en construcción por el equipo.
        </p>
      </div>
    </div>
  );
}
