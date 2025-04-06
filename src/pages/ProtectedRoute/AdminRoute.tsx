import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Loading from "../Loading/Loading";

const AdminRoute = () => {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  console.log("Admin Route status",{
    isLoading,
    isAuthenticated,
    isAdmin,
  });

  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  if (!isAdmin) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
};

export default AdminRoute;
