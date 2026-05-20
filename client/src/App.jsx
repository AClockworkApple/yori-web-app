import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RestaurantProvider } from './context/RestaurantContext';
import { TableProvider } from './context/TableContext';
import { BookingProvider } from './context/BookingContext';
import { MenuItemProvider } from './context/MenuItemContext';
import { OrderProvider } from './context/OrderContext';
import RestaurantsPage from './pages/RestaurantsPage';
import TablesPage from './pages/TablesPage';
import BookingsPage from './pages/BookingsPage';
import MenuItemsPage from './pages/MenuItemsPage';
import OrdersPage from './pages/OrdersPage';

function App() {
  return (
    <RestaurantProvider>
      <TableProvider>
        <BookingProvider>
          <MenuItemProvider>
            <OrderProvider>
              <Router>
                <nav style={{ padding: '10px', backgroundColor: '#f8f9fa', marginBottom: '20px' }}>
                  <a href="/" style={{ marginRight: '20px' }}>Restaurants</a>
                  <a href="/tables" style={{ marginRight: '20px' }}>Tables</a>
                  <a href="/bookings" style={{ marginRight: '20px' }}>Bookings</a>
                  <a href="/menu-items" style={{ marginRight: '20px' }}>Menu Items</a>
                  <a href="/orders">Orders</a>
                </nav>
                <Routes>
                  <Route path="/" element={<RestaurantsPage />} />
                  <Route path="/tables" element={<TablesPage />} />
                  <Route path="/bookings" element={<BookingsPage />} />
                  <Route path="/menu-items" element={<MenuItemsPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                </Routes>
              </Router>
            </OrderProvider>
          </MenuItemProvider>
        </BookingProvider>
      </TableProvider>
    </RestaurantProvider>
  );
}

export default App;