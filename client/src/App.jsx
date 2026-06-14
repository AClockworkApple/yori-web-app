import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { RestaurantProvider } from './context/RestaurantContext';
import { TableProvider } from './context/TableContext';
import { BookingProvider } from './context/BookingContext';
import { MenuItemProvider } from './context/MenuItemContext';
import { OrderProvider } from './context/OrderContext';
import { UserProvider } from './context/UserContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RestaurantHourProvider } from './context/RestaurantHourContext';
import RestaurantsPage from './pages/RestaurantsPage';
import TablesPage from './pages/TablesPage';
import BookingsPage from './pages/BookingsPage';
import WalkInPage from './pages/WalkInPage';
import MenuItemsPage from './pages/MenuItemsPage';
import OrdersPage from './pages/OrdersPage';
import UsersPage from './pages/UsersPage';
import RestaurantHoursPage from './pages/RestaurantHoursPage';
import LoginPage from './pages/LoginPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <p style={{ padding: '20px' }}>Loading...</p>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppNav() {
  const { isAuthenticated, user, hasRole, logout } = useAuth();
  if (!isAuthenticated) return null;
  return (
    <nav style={{ padding: '10px', backgroundColor: '#f8f9fa', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
      <a href="/" style={{ marginRight: '20px' }}>Restaurants</a>
      <a href="/tables" style={{ marginRight: '20px' }}>Tables</a>
      <a href="/bookings" style={{ marginRight: '20px' }}>Bookings</a>
      <a href="/walk-ins" style={{ marginRight: '20px' }}>Walk-ins</a>
      <a href="/menu-items" style={{ marginRight: '20px' }}>Menu Items</a>
      <a href="/orders" style={{ marginRight: '20px' }}>Orders</a>
      <a href="/restaurant-hours" style={{ marginRight: '20px' }}>Hours</a>
      {hasRole('OWNER', 'MANAGER') && <a href="/users" style={{ marginRight: '20px' }}>Users</a>}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '13px', color: '#666' }}>{user?.name} ({user?.role})</span>
        <button onClick={logout} style={{ padding: '4px 12px', cursor: 'pointer', fontSize: '13px' }}>Logout</button>
      </div>
    </nav>
  );
}

function AppRoutes() {
  return (
    <RestaurantProvider>
      <TableProvider>
        <BookingProvider>
          <MenuItemProvider>
            <OrderProvider>
                  <UserProvider>
                    <RestaurantHourProvider>
                      <Router>
                        <AppNav />
                        <Routes>
                          <Route path="/login" element={<LoginPage />} />
                          <Route path="/" element={<ProtectedRoute><RestaurantsPage /></ProtectedRoute>} />
                          <Route path="/tables" element={<ProtectedRoute><TablesPage /></ProtectedRoute>} />
                          <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
                          <Route path="/walk-ins" element={<ProtectedRoute><WalkInPage /></ProtectedRoute>} />
                          <Route path="/menu-items" element={<ProtectedRoute><MenuItemsPage /></ProtectedRoute>} />
                          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                          <Route path="/users" element={<ProtectedRoute><UsersPage /></ProtectedRoute>} />
                          <Route path="/restaurant-hours" element={<ProtectedRoute><RestaurantHoursPage /></ProtectedRoute>} />
                        </Routes>
                      </Router>
                    </RestaurantHourProvider>
                  </UserProvider>
            </OrderProvider>
          </MenuItemProvider>
        </BookingProvider>
      </TableProvider>
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