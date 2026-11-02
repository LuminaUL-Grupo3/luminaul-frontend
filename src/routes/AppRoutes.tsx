import { lazy, Suspense } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Layout } from "@/components/layout";
import { Loading } from "@/components/ui";
import { AuthPage, useSession } from "@/features/auth";

// Cada dominio se descarga cuando se visita, manteniendo ligera la entrada pública.
const LandingPage = lazy(() =>
  import("@/features/welcome/LandingPage").then((module) => ({
    default: module.LandingPage,
  })),
);
const FeedPage = lazy(() =>
  import("@/features/posts").then((module) => ({ default: module.FeedPage })),
);
const PostEditor = lazy(() =>
  import("@/features/posts").then((module) => ({ default: module.PostEditor })),
);
const GroupsPage = lazy(() =>
  import("@/features/chat").then((module) => ({ default: module.GroupsPage })),
);
const GroupDetailPage = lazy(() =>
  import("@/features/chat").then((module) => ({
    default: module.GroupDetailPage,
  })),
);
const RequestsPage = lazy(() =>
  import("@/features/chat").then((module) => ({
    default: module.RequestsPage,
  })),
);
const ChatPage = lazy(() =>
  import("@/features/chat").then((module) => ({ default: module.ChatPage })),
);
const ProfilePage = lazy(() =>
  import("@/features/profile").then((module) => ({
    default: module.ProfilePage,
  })),
);
const EditProfilePage = lazy(() =>
  import("@/features/profile").then((module) => ({
    default: module.EditProfilePage,
  })),
);
const AvailabilityPage = lazy(() =>
  import("@/features/profile").then((module) => ({
    default: module.AvailabilityPage,
  })),
);
const SettingsPage = lazy(() =>
  import("@/features/profile").then((module) => ({
    default: module.SettingsPage,
  })),
);
const MyReviewsPage = lazy(() =>
  import("@/features/reviews").then((module) => ({
    default: module.MyReviewsPage,
  })),
);
const AdminPage = lazy(() =>
  import("@/features/admin").then((module) => ({ default: module.AdminPage })),
);
const ModerationPage = lazy(() =>
  import("@/features/admin").then((module) => ({
    default: module.ModerationPage,
  })),
);
const NotificationsPage = lazy(() =>
  import("@/features/admin").then((module) => ({
    default: module.NotificationsPage,
  })),
);

/** Muestra una carga accesible mientras llega únicamente el código de la presentación. */
function PresentationRoute() {
  return (
    <Suspense fallback={<Loading />}>
      <LandingPage />
    </Suspense>
  );
}

function AdminRoutePage() {
  const { user } = useSession();
  return user?.role === "admin" ? <AdminPage /> : <Navigate to="/" replace />;
}

function UnknownPage() {
  return (
    <div className="empty">
      <h1>Esta página no existe.</h1>
      <Link className="button" to="/">
        Volver al inicio <ArrowUpRight size={18} />
      </Link>
    </div>
  );
}

/** La raíz presenta LuminaUL a visitantes y conserva el feed para sesiones existentes. */
function EntryRoute() {
  const { user, loading } = useSession();
  if (loading) return <Loading />;
  return user ? <Layout /> : <PresentationRoute />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<EntryRoute />}>
        <Route index element={<FeedPage />} />
      </Route>
      <Route path="/nosotros" element={<PresentationRoute />} />
      <Route path="/login" element={<AuthPage />} />
      <Route
        path="/registro"
        element={<AuthPage key="register" mode="register" />}
      />
      <Route
        path="/verificar"
        element={<AuthPage key="verify" mode="verify" />}
      />
      <Route
        path="/recuperar"
        element={<AuthPage key="recover" mode="recover" />}
      />
      <Route
        path="/restablecer"
        element={<AuthPage key="reset" mode="reset" />}
      />
      <Route element={<Layout />}>
        <Route path="buscar" element={<FeedPage search />} />
        <Route path="mis-publicaciones" element={<FeedPage mine />} />
        <Route path="publicar" element={<PostEditor />} />
        <Route path="publicar/:id" element={<PostEditor />} />
        <Route path="grupos" element={<GroupsPage />} />
        <Route path="grupos/:id" element={<GroupDetailPage />} />
        <Route path="solicitudes" element={<RequestsPage />} />
        <Route path="mensajes" element={<ChatPage />} />
        <Route path="mensajes/:id" element={<ChatPage />} />
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="perfil/editar" element={<EditProfilePage />} />
        <Route path="perfil/:id" element={<ProfilePage />} />
        <Route path="horario" element={<AvailabilityPage />} />
        <Route path="mis-resenas" element={<MyReviewsPage />} />
        <Route path="moderacion" element={<ModerationPage />} />
        <Route path="notificaciones" element={<NotificationsPage />} />
        <Route path="configuracion" element={<SettingsPage />} />
        <Route path="admin" element={<AdminRoutePage />} />
        <Route path="*" element={<UnknownPage />} />
      </Route>
    </Routes>
  );
}
