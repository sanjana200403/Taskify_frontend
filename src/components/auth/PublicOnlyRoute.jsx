import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Loader from "../common/Loader.jsx";

export default function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Loader fullScreen label="Loading" />;
  return user ? <Navigate to="/app" replace /> : <Outlet />;
}
