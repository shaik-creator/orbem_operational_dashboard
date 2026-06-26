import { Navigate, Outlet } from 'react-router-dom';

export default function PublicRoute({ children }) {
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('orbem_token');

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children || <Outlet />;
}
