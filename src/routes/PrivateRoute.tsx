import { Navigate, Outlet } from "react-router-dom";
import { useSession } from "../features/auth/hooks/useSession";
import { Loading } from "../components/ui";

export function PrivateRoute() {
  const { user, loading } = useSession();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
}

export function AdminRoute() {
  const { user } = useSession();
  return user?.role === "admin" ? <Outlet /> : <Navigate to="/" replace />;
}
