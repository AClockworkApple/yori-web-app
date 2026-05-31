import { createContext, useContext, useState } from 'react';
import { userService } from '../services/userService';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersByRole = async (role) => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getByRole(role);
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersByRestaurant = async (restaurantId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getByRestaurant(restaurantId);
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await userService.create(data);
      setUsers([...users, newUser]);
      return newUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await userService.update(id, data);
      setUsers(users.map(u => u.id === id ? updated : u));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await userService.delete(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{
      users,
      loading,
      error,
      fetchUsers,
      fetchUsersByRole,
      fetchUsersByRestaurant,
      createUser,
      updateUser,
      deleteUser,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUsers must be used within UserProvider');
  }
  return context;
}
