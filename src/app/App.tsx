import { BrowserRouter, Routes, Route } from 'react-router';
import { Navbar } from './components/Navbar';
import { AppSidebar } from './components/AppSidebar';
import { SearchPage } from './pages/SearchPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

// Cascarón de LuminaUL (bloque "Layout, Búsqueda y Filtros"): Navbar superior +
// AppSidebar lateral y el área de contenido enrutada. En este slice solo /buscar
// está implementada de verdad; el resto de rutas son placeholders hasta que el
// equipo integre sus pantallas del export de Figma.
function AppContent() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <AppSidebar />
      <main className="ml-64 mt-16 p-8">
        <Routes>
          {/* Búsqueda y filtros (HU 1.3) — implementado */}
          <Route path="/buscar" element={<SearchPage />} />

          {/* Rutas del equipo — placeholder hasta su integración */}
          <Route path="/" element={<PlaceholderPage title="Feed" />} />
          <Route path="/grupos" element={<PlaceholderPage title="Grupos" />} />
          <Route path="/mensajes" element={<PlaceholderPage title="Mensajes" />} />
          <Route path="/solicitudes" element={<PlaceholderPage title="Solicitudes" />} />
          <Route path="/crear" element={<PlaceholderPage title="Crear publicación" />} />
          <Route path="/mis-publicaciones" element={<PlaceholderPage title="Mis publicaciones" />} />
          <Route path="/perfil" element={<PlaceholderPage title="Mi perfil" />} />
          <Route path="/configuracion" element={<PlaceholderPage title="Configuración" />} />
          <Route path="/admin/moderacion" element={<PlaceholderPage title="Panel de moderación" />} />
          <Route path="/admin/reportes" element={<PlaceholderPage title="Reportes" />} />
          <Route path="/admin/apelaciones" element={<PlaceholderPage title="Apelaciones" />} />
          <Route
            path="/admin/historial-apelaciones"
            element={<PlaceholderPage title="Historial de apelaciones" />}
          />
          <Route path="*" element={<PlaceholderPage title="En construcción" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
