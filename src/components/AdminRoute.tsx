import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const ADMIN_ROLES = ["superAdmin", "admin"];

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/yonetim" replace />;
  if (!ADMIN_ROLES.includes(user.roleId)) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default AdminRoute;
export { ADMIN_ROLES };
