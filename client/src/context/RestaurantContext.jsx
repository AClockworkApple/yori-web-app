import { createContext, useContext, useState, useEffect } from 'react';
import { restaurantService } from '../services/restaurantService';

const RestaurantContext = createContext();

export function RestaurantProvider({ children }) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRestaurants = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await restaurantService.getAll();
      setRestaurants(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createRestaurant = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const newRestaurant = await restaurantService.create(data);
      setRestaurants([...restaurants, newRestaurant]);
      return newRestaurant;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateRestaurant = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await restaurantService.update(id, data);
      setRestaurants(restaurants.map(r => r.id === id ? updated : r));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteRestaurant = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await restaurantService.delete(id);
      setRestaurants(restaurants.filter(r => r.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <RestaurantContext.Provider value={{
      restaurants,
      loading,
      error,
      fetchRestaurants,
      createRestaurant,
      updateRestaurant,
      deleteRestaurant,
    }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurants() {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurants must be used within RestaurantProvider');
  }
  return context;
}