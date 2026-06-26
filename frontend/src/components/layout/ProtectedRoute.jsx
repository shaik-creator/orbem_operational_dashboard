import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('orbem_token');

  const userRaw =
    localStorage.getItem('user') ||
    localStorage.getItem('orbem_user');

  let user = null;
  try {
    user = userRaw ? JSON.parse(userRaw) : null;
  } catch {
    user = null;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children || <Outlet />;
}
