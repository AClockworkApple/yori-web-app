import { createContext, useContext, useState } from 'react';
import { restaurantHourService } from '../services/restaurantHourService';

const RestaurantHourContext = createContext();

export function RestaurantHourProvider({ children }) {
  const [hours, setHours] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHours = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await restaurantHourService.getAll();
      setHours(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHoursByRestaurant = async (restaurantId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await restaurantHourService.getByRestaurant(restaurantId);
      setHours(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createHour = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const newHour = await restaurantHourService.create(data);
      setHours([...hours, newHour]);
      return newHour;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateHour = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await restaurantHourService.update(id, data);
      setHours(hours.map(h => h.id === id ? updated : h));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteHour = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await restaurantHourService.delete(id);
      setHours(hours.filter(h => h.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <RestaurantHourContext.Provider value={{
      hours, loading, error,
      fetchHours, fetchHoursByRestaurant,
      createHour, updateHour, deleteHour,
    }}>
      {children}
    </RestaurantHourContext.Provider>
  );
}

export function useRestaurantHours() {
  const context = useContext(RestaurantHourContext);
  if (!context) {
    throw new Error('useRestaurantHours must be used within RestaurantHourProvider');
  }
  return context;
}
