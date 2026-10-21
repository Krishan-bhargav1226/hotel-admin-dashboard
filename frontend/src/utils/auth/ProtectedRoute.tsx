import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./authContextDef";
import { AppEndPoints } from "../rout-endpoints/AppEndPoints";

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page while preserving target path
    return <Navigate to={AppEndPoints.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
