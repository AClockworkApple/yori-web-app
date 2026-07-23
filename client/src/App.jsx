import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
import AiConfigPage from './pages/AiConfigPage';
import CustomerHomePage from './pages/CustomerHomePage';
import CustomerMenuPage from './pages/CustomerMenuPage';
import CustomerBookingPage from './pages/CustomerBookingPage';
import CustomerChatWidget from './components/CustomerChatWidget';

const globalStyle = document.createElement('style');
globalStyle.textContent = `
  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { margin: 0; padding: 0; width: 100%; min-height: 100vh; }
  body { background: #0a0a0a; color: #e0e0e0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
  input, select, textarea {
    background: rgba(255,255,255,0.06) !important; color: #fff !important;
    border: 1px solid rgba(255,255,255,0.12) !important; border-radius: 4px !important;
    padding: 8px 10px !important; font-size: 14px !important; outline: none;
  }
  input:focus, select:focus, textarea:focus { border-color: rgba(139,0,0,0.4) !important; }
  select option { background: #1a1a1a !important; color: #fff !important; }
  table { border-collapse: collapse; width: 100%; }
  th { background: rgba(255,255,255,0.05) !important; color: rgba(255,255,255,0.7) !important; font-weight: 600 !important; text-transform: uppercase !important; font-size: 11px !important; letter-spacing: 1px !important; }
  td, th { border: 1px solid rgba(255,255,255,0.08) !important; padding: 10px 12px !important; }
  tr:hover td { background: rgba(255,255,255,0.02); }
  h1, h2, h3, h4 { color: #fff !important; font-weight: 300 !important; letter-spacing: 1px !important; }
  a { transition: opacity 0.2s; }
  a:hover { opacity: 0.8; }
  label { color: rgba(255,255,255,0.5) !important; font-size: 12px !important; letter-spacing: 0.5px !important; }
  button {
    background: rgba(255,255,255,0.08) !important; color: #fff !important;
    border: 1px solid rgba(255,255,255,0.12) !important; border-radius: 4px !important;
    padding: 8px 18px !important; cursor: pointer !important; font-size: 13px !important;
    transition: all 0.2s !important;
  }
  button:hover { background: rgba(255,255,255,0.14) !important; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 3px; }
  p { color: rgba(255,255,255,0.6); }
`;
document.head.appendChild(globalStyle);

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <p style={{ padding: '20px' }}>Loading...</p>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppNav() {
  const location = useLocation();
  const publicPaths = ['/', '/menu', '/booking', '/login'];
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

  return (
    <>
      {selectedRestaurantId && activeAnnouncements.length > 0 && (
        <div style={{
          padding: '8px 16px', backgroundColor: 'rgba(180,120,0,0.15)', borderBottom: '1px solid rgba(255,215,0,0.3)',
          display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '14px'
        }}>
          {activeAnnouncements.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                display: 'inline-block', padding: '1px 8px', borderRadius: '3px',
                fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase',
                backgroundColor: a.priority === 'IMPORTANT' ? '#c0392b' : a.priority === 'WARNING' ? '#d4a017' : '#2980b9',
                color: '#fff',
              }}>{a.priority}</span>
              <span style={{ color: 'rgba(255,255,255,0.8)' }}>{a.message}</span>
            </div>
          ))}
        </div>
      )}
      <nav style={{
        padding: '10px 20px', backgroundColor: 'rgba(0,0,0,0.9)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', position: 'sticky', top: 0, zIndex: 900,
        backdropFilter: 'blur(8px)',
      }}>
        {[
          { href: '/restaurants', label: 'Restaurants' },
          { href: '/menu-items', label: 'Menu Items' },
          { href: '/daily-report', label: 'Daily Report' },
          { href: '/reconciliation', label: 'Reconciliation' },
          { href: '/ai-config', label: 'AI' },
          ...(hasRole('OWNER', 'MANAGER') ? [
            { href: '/users', label: 'Users' },
            { href: '/announcements', label: 'Announcements' },
            { href: '/gdpr', label: 'GDPR' },
            { href: '/audit-log', label: 'Audit Log' },
          ] : []),
        ].map(item => (
          <a key={item.href} href={item.href} style={{
            marginRight: '16px', color: location.pathname === item.href || location.pathname.startsWith(item.href + '/') ? '#ffd700' : 'rgba(255,255,255,0.55)',
            textDecoration: 'none', fontSize: '13px', letterSpacing: '0.5px', fontWeight: location.pathname === item.href ? '600' : '400',
            padding: '4px 0', borderBottom: location.pathname === item.href ? '2px solid #ffd700' : '2px solid transparent',
          }}>{item.label}</a>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{user?.name} ({user?.role})</span>
          <button onClick={logout} style={{
            padding: '5px 14px', cursor: 'pointer', fontSize: '12px', letterSpacing: '0.5px',
            backgroundColor: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '4px', transition: 'all 0.2s',
          }}>Logout</button>
        </div>
      </nav>
    </>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <CustomerHomePage />
          </motion.div>
        } />
        <Route path="/menu" element={
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <CustomerMenuPage />
          </motion.div>
        } />
        <Route path="/booking" element={
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <CustomerBookingPage />
          </motion.div>
        } />
      </Routes>
    </AnimatePresence>
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
                      <AnimatedRoutes />
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
                        <Route path="/ai-config" element={<ProtectedRoute><AiConfigPage /></ProtectedRoute>} />
                        <Route path="/restaurant-hours" element={<ProtectedRoute><RestaurantHoursPage /></ProtectedRoute>} />
                        <Route path="/receipts/:orderId" element={<ProtectedRoute><ReceiptPage /></ProtectedRoute>} />
                      </Routes>
                    </Router>
                    <CustomerChatWidget />
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