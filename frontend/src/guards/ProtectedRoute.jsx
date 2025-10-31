import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Spin } from "antd";
import { ROUTES } from "../constants";

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, loading, hasRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Check if user has required roles
  if (roles.length > 0 && !hasRole(roles)) {
    // Redirect to forbidden page or home
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  return children;
};

export default ProtectedRoute;
