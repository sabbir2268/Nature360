import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import { PATHS } from "../utils/paths";
import { Loader } from "../components/ui/Loader";

export default function PublicRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-mist text-ink">
        <Loader />
      </div>
    );
  }

  return user ? (
    <Navigate to={location.state?.from?.pathname || PATHS.DASHBOARD} replace />
  ) : (
    <Outlet />
  );
}
