import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, roles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();
  console.log({
    loading,
    isAuthenticated,
    user,
  });
  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    console.log("Unauthorized access attempt by user with role:", user?.role);
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;
