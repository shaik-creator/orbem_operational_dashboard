import RoleDashboardBase from './RoleDashboardBase';

export default function AdminDashboard() {
  return (
    <RoleDashboardBase
      title="Admin Command Center"
      subtitle="Full company performance, revenue, staff, alerts, and operations overview."
      statusText="Admin / Owner"
      queueTitle="Company operations"
      cards={[
        { key: 'totalBookings', label: 'Total bookings', icon: 'bookings', tone: '#1d9e75' },
        { key: 'activeShipments', label: 'Active shipments', icon: 'shipments', tone: '#378add' },
        { key: 'completedShipments', label: 'Completed shipments', icon: 'complete', tone: '#059669' },
        { key: 'pendingDocuments', label: 'Pending documents', icon: 'documents', tone: '#ef9f27' },
        { key: 'delayedShipments', label: 'Delayed shipments', icon: 'alerts', tone: '#e24b4a' },
        { key: 'monthlyRevenue', label: 'Monthly revenue', icon: 'revenue', type: 'currency', tone: '#0f766e' },
        { key: 'pendingPayments', label: 'Pending payments', icon: 'payments', type: 'currency', tone: '#d97706' },
        { key: 'activeStaffToday', label: 'Staff active today', icon: 'staff', tone: '#6366f1' }
      ]}
      quickLinks={[
        { to: '/bookings', label: 'Review bookings', hint: 'All' },
        { to: '/revenue', label: 'Open revenue', hint: 'Finance' },
        { to: '/staff', label: 'Manage staff', hint: 'Admin' },
        { to: '/reports', label: 'View reports', hint: 'Charts' }
      ]}
    />
  );
}
