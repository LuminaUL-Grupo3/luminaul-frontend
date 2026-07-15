import { BrowserRouter, Routes, Route, useLocation } from 'react-router';
import { Navbar } from './components/Navbar';
import { AppSidebar } from './components/AppSidebar';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { EmailVerificationPage } from './pages/EmailVerificationPage';
import { VerifyAccountPage } from './pages/VerifyAccountPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { FeedPage } from './pages/FeedPage';
import { SearchPage } from './pages/SearchPage';
import { GroupsPage } from './pages/GroupsPage';
import { GroupDetailPage } from './pages/GroupDetailPage';
import { MembersListPage } from './pages/MembersListPage';
import { ManageMembersPage } from './pages/ManageMembersPage';
import { MessagesPage } from './pages/MessagesPage';
import { GroupChatPage } from './pages/GroupChatPage';
import { GroupRequestsPage } from './pages/GroupRequestsPage';
import { CreatePostPage } from './pages/CreatePostPage';
import { MyPostsPage } from './pages/MyPostsPage';
import { EditPostPage } from './pages/EditPostPage';
import { ProfilePage } from './pages/ProfilePage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { EditProfilePage } from './pages/EditProfilePage';
import { AvailabilityPage } from './pages/AvailabilityPage';
import { EditAvailabilityPage } from './pages/EditAvailabilityPage';
import { DeleteAvailabilityPage } from './pages/DeleteAvailabilityPage';
import { WriteReviewPage } from './pages/WriteReviewPage';
import { StudentReviewsPage } from './pages/StudentReviewsPage';
import { EditReviewPage } from './pages/EditReviewPage';
import { ModerationPage } from './pages/ModerationPage';
import { MyModeratedContentPage } from './pages/MyModeratedContentPage';
import { AppealPage } from './pages/AppealPage';
import { UserSuspensionPage } from './pages/UserSuspensionPage';
import { ReportedPostPage } from './pages/ReportedPostPage';
import { AppealReviewPage } from './pages/AppealReviewPage';
import { ReportHistoryPage } from './pages/ReportHistoryPage';
import { AppealHistoryPage } from './pages/AppealHistoryPage';
import { SuspendedLoginPage } from './pages/SuspendedLoginPage';
import { SettingsPage } from './pages/SettingsPage';
import { AccountSettingsPage } from './pages/AccountSettingsPage';
import { MyPublishedReviewsPage } from './pages/MyPublishedReviewsPage';

function AppContent() {
  const location = useLocation();
  const isAuthPage = ['/login', '/registro', '/verificar-correo', '/verificar-cuenta', '/recuperar-password', '/actualizar-password', '/cuenta-suspendida'].includes(location.pathname);

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/verificar-correo" element={<EmailVerificationPage />} />
        <Route path="/verificar-cuenta" element={<VerifyAccountPage />} />
        <Route path="/recuperar-password" element={<ForgotPasswordPage />} />
        <Route path="/actualizar-password" element={<ResetPasswordPage />} />
        <Route path="/cuenta-suspendida" element={<SuspendedLoginPage />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <AppSidebar />
      <main className="ml-64 mt-16 p-8">
        <Routes>
          <Route path="/" element={<FeedPage />} />
          <Route path="/buscar" element={<SearchPage />} />
          <Route path="/grupos" element={<GroupsPage />} />
          <Route path="/grupos/:id" element={<GroupDetailPage />} />
          <Route path="/grupos/:id/integrantes" element={<MembersListPage />} />
          <Route path="/grupos/:id/administrar" element={<ManageMembersPage />} />
          <Route path="/mensajes" element={<MessagesPage />} />
          <Route path="/mensajes/:id" element={<GroupChatPage />} />
          <Route path="/solicitudes" element={<GroupRequestsPage />} />
          <Route path="/crear" element={<CreatePostPage />} />
          <Route path="/mis-publicaciones" element={<MyPostsPage />} />
          <Route path="/editar/:id" element={<EditPostPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/perfil/estudiante/:id" element={<PublicProfilePage />} />
          <Route path="/perfil/editar" element={<EditProfilePage />} />
          <Route path="/perfil/disponibilidad" element={<AvailabilityPage />} />
          <Route path="/perfil/disponibilidad/editar" element={<EditAvailabilityPage />} />
          <Route path="/perfil/disponibilidad/eliminar" element={<DeleteAvailabilityPage />} />
          <Route path="/perfil/:id/resena" element={<WriteReviewPage />} />
          <Route path="/perfil/:id/resenas" element={<StudentReviewsPage />} />
          <Route path="/perfil/mis-resenas" element={<MyPublishedReviewsPage />} />
          <Route path="/perfil/resenas-recibidas" element={<StudentReviewsPage />} />
          <Route path="/perfil/:id/resenas/:reviewId/editar" element={<EditReviewPage />} />
          <Route path="/configuracion" element={<SettingsPage />} />
          <Route path="/configuracion/cuenta" element={<AccountSettingsPage />} />
          <Route path="/admin/moderacion" element={<ModerationPage />} />
          <Route path="/admin/usuarios/:id/suspension" element={<UserSuspensionPage />} />
          <Route path="/admin/publicaciones/:id/reporte" element={<ReportedPostPage />} />
          <Route path="/admin/apelaciones" element={<AppealReviewPage />} />
          <Route path="/admin/reportes" element={<ReportHistoryPage />} />
          <Route path="/admin/historial-apelaciones" element={<AppealHistoryPage />} />
          <Route path="/perfil/mis-contenidos-moderados" element={<MyModeratedContentPage />} />
          <Route path="/perfil/apelaciones" element={<AppealPage />} />
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