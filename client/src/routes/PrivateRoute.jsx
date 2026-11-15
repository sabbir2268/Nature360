import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import { PATHS } from "../utils/paths";
import { Loader } from "../components/ui/Loader";

function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-mist text-ink">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Remember where they were going so login can send them back
    return <Navigate to={PATHS.LOGIN} replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default PrivateRoute;
