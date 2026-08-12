import { ROUTES } from "../constants/routes";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} />;
  }

  switch (user.role) {
    case "admin":
      return <Navigate to={ROUTES.ADMIN_DASHBOARD} />;

    case "mentor":
      return <Navigate to={ROUTES.MENTOR_DASHBOARD} />;

    case "mentee":
      return <Navigate to={ROUTES.MENTEE_DASHBOARD} />;

    default:
      return <Navigate to={ROUTES.LOGIN} />;
  }
}
export default RootRedirect;
