import { createContext, useContext, useState } from 'react';
import { tableService } from '../services/tableService';

const TableContext = createContext();

export function TableProvider({ children }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTables = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tableService.getAll();
      setTables(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTablesByRestaurant = async (restaurantId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await tableService.getByRestaurant(restaurantId);
      setTables(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createTable = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const newTable = await tableService.create(data);
      setTables([...tables, newTable]);
      return newTable;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTable = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await tableService.update(id, data);
      setTables(tables.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTableStatus = async (id, status) => {
    setError(null);
    try {
      const updated = await tableService.updateStatus(id, status);
      setTables(tables.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteTable = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await tableService.delete(id);
      setTables(tables.filter(t => t.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <TableContext.Provider value={{
      tables,
      loading,
      error,
      fetchTables,
      fetchTablesByRestaurant,
      createTable,
      updateTable,
      updateTableStatus,
      deleteTable,
    }}>
      {children}
    </TableContext.Provider>
  );
}

export function useTables() {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error('useTables must be used within TableProvider');
  }
  return context;
}