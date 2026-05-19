import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RestaurantProvider } from './context/RestaurantContext';
import RestaurantsPage from './pages/RestaurantsPage';

function App() {
  return (
    <RestaurantProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RestaurantsPage />} />
        </Routes>
      </Router>
    </RestaurantProvider>
  );
}

export default App;