import { Routes, Route, Link, Navigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Layout } from "@/components/layout";
import { AuthPage, useSession } from "@/features/auth";
import { FeedPage, PostEditor } from "@/features/posts";
import {
  GroupsPage,
  GroupDetailPage,
  RequestsPage,
  ChatPage,
} from "@/features/chat";
import {
  ProfilePage,
  EditProfilePage,
  AvailabilityPage,
  SettingsPage,
} from "@/features/profile";
import { MyReviewsPage } from "@/features/reviews";
import {
  AdminPage,
  ModerationPage,
  NotificationsPage,
} from "@/features/admin";

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

export function AppRoutes() {
  return (
    <Routes>
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
        <Route index element={<FeedPage />} />
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
