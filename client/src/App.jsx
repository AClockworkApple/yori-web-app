import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { RestaurantProvider, useRestaurants } from './context/RestaurantContext';
import { TableProvider } from './context/TableContext';
import { BookingProvider } from './context/BookingContext';
import { MenuItemProvider } from './context/MenuItemContext';
import { OrderProvider } from './context/OrderContext';
import { UserProvider } from './context/UserContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RestaurantHourProvider } from './context/RestaurantHourContext';
import { AnnouncementProvider, useAnnouncements } from './context/AnnouncementContext';
import { SocketProvider } from './context/SocketContext';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import TablesPage from './pages/TablesPage';
import BookingsPage from './pages/BookingsPage';
import WalkInPage from './pages/WalkInPage';
import MenuItemsPage from './pages/MenuItemsPage';
import CategoriesPage from './pages/CategoriesPage';
import OrdersPage from './pages/OrdersPage';
import UsersPage from './pages/UsersPage';
import RestaurantHoursPage from './pages/RestaurantHoursPage';
import ReceiptPage from './pages/ReceiptPage';
import LoginPage from './pages/LoginPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import TableStatusBoard from './pages/TableStatusBoard';
import DailyReportPage from './pages/DailyReportPage';
import GdprPage from './pages/GdprPage';
import AuditLogPage from './pages/AuditLogPage';
import DailyReconciliationPage from './pages/DailyReconciliationPage';
import CustomerHomePage from './pages/CustomerHomePage';
import CustomerMenuPage from './pages/CustomerMenuPage';
import CustomerBookingPage from './pages/CustomerBookingPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <p style={{ padding: '20px' }}>Loading...</p>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppNav() {
  const location = useLocation();
  const publicPaths = ['/', '/menu', '/booking'];
  const { isAuthenticated, user, hasRole, logout } = useAuth();
  const { fetchRestaurants, selectedRestaurantId } = useRestaurants();
  const { activeAnnouncements, fetchActive } = useAnnouncements();
  const [announceInterval, setAnnounceInterval] = useState(null);

  useEffect(() => {
    if (isAuthenticated) fetchRestaurants();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !selectedRestaurantId) return;
    fetchActive(selectedRestaurantId);
    const interval = setInterval(() => fetchActive(selectedRestaurantId), 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, selectedRestaurantId]);

  if (!isAuthenticated || publicPaths.includes(location.pathname)) return null;

  const priorityColors = { IMPORTANT: '#dc3545', WARNING: '#ffc107', INFO: '#17a2b8' };

  return (
    <>
      {selectedRestaurantId && activeAnnouncements.length > 0 && (
        <div style={{
          padding: '8px 16px', backgroundColor: '#fff3cd', borderBottom: '1px solid #ffc107',
          display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px'
        }}>
          {activeAnnouncements.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                display: 'inline-block', padding: '1px 8px', borderRadius: '3px',
                fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase',
                backgroundColor: priorityColors[a.priority],
                color: a.priority === 'WARNING' ? '#000' : '#fff',
              }}>{a.priority}</span>
              <span>{a.message}</span>
            </div>
          ))}
        </div>
      )}
      <nav style={{ padding: '10px', backgroundColor: '#f8f9fa', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <a href="/restaurants" style={{ marginRight: '20px' }}>Restaurants</a>
        <a href="/menu-items" style={{ marginRight: '20px' }}>Menu Items</a>
        <a href="/table-status" style={{ marginRight: '20px' }}>Table Status</a>
        <a href="/daily-report" style={{ marginRight: '20px' }}>Daily Report</a>
        <a href="/reconciliation" style={{ marginRight: '20px' }}>Reconciliation</a>
        {hasRole('OWNER', 'MANAGER') && <a href="/users" style={{ marginRight: '20px' }}>Users</a>}
        {hasRole('OWNER', 'MANAGER') && <a href="/announcements" style={{ marginRight: '20px' }}>Announcements</a>}
        {hasRole('OWNER', 'MANAGER') && <a href="/gdpr" style={{ marginRight: '20px' }}>GDPR</a>}
        {hasRole('OWNER', 'MANAGER') && <a href="/audit-log" style={{ marginRight: '20px' }}>Audit Log</a>}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#666' }}>{user?.name} ({user?.role})</span>
          <button onClick={logout} style={{ padding: '4px 12px', cursor: 'pointer', fontSize: '13px' }}>Logout</button>
        </div>
      </nav>
    </>
  );
}

function AppRoutes() {
  return (
    <RestaurantProvider>
      <SocketProvider>
      <TableProvider>
        <BookingProvider>
          <MenuItemProvider>
            <OrderProvider>
              <UserProvider>
                <RestaurantHourProvider>
                  <AnnouncementProvider>
                    <Router>
                      <Routes>
                        <Route path="/" element={<CustomerHomePage />} />
                        <Route path="/menu" element={<CustomerMenuPage />} />
                        <Route path="/booking" element={<CustomerBookingPage />} />
                      </Routes>
                      <AppNav />
                      <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/restaurants" element={<ProtectedRoute><RestaurantsPage /></ProtectedRoute>} />
                        <Route path="/restaurants/:id" element={<ProtectedRoute><RestaurantDetailPage /></ProtectedRoute>} />
                        <Route path="/tables" element={<ProtectedRoute><TablesPage /></ProtectedRoute>} />
                        <Route path="/table-status" element={<ProtectedRoute><TableStatusBoard /></ProtectedRoute>} />
                        <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
                        <Route path="/walk-ins" element={<ProtectedRoute><WalkInPage /></ProtectedRoute>} />
                        <Route path="/menu-items" element={<ProtectedRoute><MenuItemsPage /></ProtectedRoute>} />
                        <Route path="/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
                        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                        <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
                        <Route path="/announcements" element={<ProtectedRoute><AnnouncementsPage /></ProtectedRoute>} />
                        <Route path="/daily-report" element={<ProtectedRoute><DailyReportPage /></ProtectedRoute>} />
                        <Route path="/gdpr" element={<ProtectedRoute><GdprPage /></ProtectedRoute>} />
                        <Route path="/audit-log" element={<ProtectedRoute><AuditLogPage /></ProtectedRoute>} />
                        <Route path="/reconciliation" element={<ProtectedRoute><DailyReconciliationPage /></ProtectedRoute>} />
                        <Route path="/restaurant-hours" element={<ProtectedRoute><RestaurantHoursPage /></ProtectedRoute>} />
                        <Route path="/receipts/:orderId" element={<ProtectedRoute><ReceiptPage /></ProtectedRoute>} />
                      </Routes>
                    </Router>
                  </AnnouncementProvider>
                </RestaurantHourProvider>
              </UserProvider>
            </OrderProvider>
          </MenuItemProvider>
        </BookingProvider>
        </TableProvider>
      </SocketProvider>
    </RestaurantProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;