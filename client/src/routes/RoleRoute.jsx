import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import { PATHS } from "../utils/paths";
import { Loader } from "../components/ui/Loader";

export default function RoleRoute({ roles = [] }) {
  const { profile, loading } = useAuth();
  const location = useLocation();
  const role = profile?.role || "Citizen";

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Loader />
      </div>
    );
  }

  if (!roles.includes(role)) {
    return (
      <Navigate
        to={PATHS.DASHBOARD}
        replace
        state={{ message: "You do not have access to that workspace." }}
      />
    );
  }

  return <Outlet context={{ role, from: location.pathname }} />;
}
