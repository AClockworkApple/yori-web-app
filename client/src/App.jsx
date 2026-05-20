import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RestaurantProvider } from './context/RestaurantContext';
import { TableProvider } from './context/TableContext';
import { BookingProvider } from './context/BookingContext';
import RestaurantsPage from './pages/RestaurantsPage';
import TablesPage from './pages/TablesPage';
import BookingsPage from './pages/BookingsPage';

function App() {
  return (
    <RestaurantProvider>
      <TableProvider>
        <BookingProvider>
          <Router>
            <nav style={{ padding: '10px', backgroundColor: '#f8f9fa', marginBottom: '20px' }}>
              <a href="/" style={{ marginRight: '20px' }}>Restaurants</a>
              <a href="/tables" style={{ marginRight: '20px' }}>Tables</a>
              <a href="/bookings">Bookings</a>
            </nav>
            <Routes>
              <Route path="/" element={<RestaurantsPage />} />
              <Route path="/tables" element={<TablesPage />} />
              <Route path="/bookings" element={<BookingsPage />} />
            </Routes>
          </Router>
        </BookingProvider>
      </TableProvider>
    </RestaurantProvider>
  );
}

export default App;