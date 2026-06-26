import { useAuth } from '../services/authService';
import { ROLES, normalizeRole } from '../constants/roles';
import AdminDashboard from './dashboards/AdminDashboard';
import OperationsDashboard from './dashboards/OperationsDashboard';
import AccountsDashboard from './dashboards/AccountsDashboard';
import WarehouseDashboard from './dashboards/WarehouseDashboard';
import UnauthorizedPage from './UnauthorizedPage';

export default function DashboardPage() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);

  if (role === ROLES.ADMIN) return <AdminDashboard />;
  if (role === ROLES.OPERATIONS) return <OperationsDashboard />;
  if (role === ROLES.ACCOUNTS) return <AccountsDashboard />;
  if (role === ROLES.WAREHOUSE) return <WarehouseDashboard />;

  return <UnauthorizedPage />;
}
