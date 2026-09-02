import { Navigate, Outlet } from "react-router-dom";
import { UseAdmin } from "../context/AdminContext";

const ProtectedRoute = () => {
  const { admin, authLoading } = UseAdmin();

  // While checking localStorage / API
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading...
      </div>
    );
  }

  // Not logged in → go to login
  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  // Logged in → render nested admin routes
  return <Outlet />;
};

export default ProtectedRoute;