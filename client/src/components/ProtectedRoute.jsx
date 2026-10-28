import { Navigate } from "react-router-dom";
export default function ProtectedRoute({ user, admin = false, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}
