import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { RestaurantProvider, useRestaurants } from './context/RestaurantContext';
import { TableProvider } from './context/TableContext';
import { BookingProvider } from './context/BookingContext';
import { MenuItemProvider } from './context/MenuItemContext';
import { OrderProvider } from './context/OrderContext';
import { UserProvider } from './context/UserContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RestaurantHourProvider } from './context/RestaurantHourContext';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
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
  const { selectedRestaurantId, selectedRestaurant, setSelectedRestaurantId, fetchRestaurants } = useRestaurants();
  if (!isAuthenticated) return null;

  useEffect(() => {
    if (isAuthenticated) fetchRestaurants();
  }, [isAuthenticated]);

  return (
    <nav style={{ padding: '10px', backgroundColor: '#f8f9fa', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
      <a href="/" style={{ marginRight: '20px' }}>Restaurants</a>
      <a href="/menu-items" style={{ marginRight: '20px' }}>Menu Items</a>
      {hasRole('OWNER', 'MANAGER') && <a href="/users" style={{ marginRight: '20px' }}>Users</a>}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {selectedRestaurant && (
          <span style={{ fontSize: '13px', backgroundColor: '#e9ecef', padding: '4px 10px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {selectedRestaurant.name}
            <button onClick={() => setSelectedRestaurantId('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc3545', fontSize: '16px', padding: '0', lineHeight: '1' }} title="Deselect">&times;</button>
          </span>
        )}
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
                          <Route path="/restaurants/:id" element={<ProtectedRoute><RestaurantDetailPage /></ProtectedRoute>} />
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