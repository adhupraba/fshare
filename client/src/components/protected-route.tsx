import { RootState } from "@/store";
import { TRole } from "@/types/auth";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

interface IProtectedRouteProps {
  children: React.ReactNode;
  isPrivate?: boolean;
  openRoute?: boolean;
  allowedRoles?: TRole[];
}

const ProtectedRoute: React.FC<IProtectedRouteProps> = ({ children, isPrivate, openRoute, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const userRole = user?.role;

  if (openRoute && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (isPrivate && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isPrivate && allowedRoles && allowedRoles.length > 0) {
    if (!userRole || !allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
