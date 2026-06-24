import { createContext, useContext, useState, useCallback } from 'react';
import { announcementService } from '../services/announcementService';

const AnnouncementContext = createContext();

export function AnnouncementProvider({ children }) {
  const [announcements, setAnnouncements] = useState([]);
  const [activeAnnouncements, setActiveAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchByRestaurant = useCallback(async (restaurantId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await announcementService.getByRestaurant(restaurantId);
      setAnnouncements(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActive = useCallback(async (restaurantId) => {
    setError(null);
    try {
      const data = await announcementService.getActive(restaurantId);
      setActiveAnnouncements(data);
      return data;
    } catch (err) {
      setError(err.message);
      return [];
    }
  }, []);

  const createAnnouncement = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const newAnnouncement = await announcementService.create(data);
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      return newAnnouncement;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAnnouncement = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await announcementService.update(id, data);
      setAnnouncements(prev => prev.map(a => a.id === id ? updated : a));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAnnouncement = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await announcementService.delete(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AnnouncementContext.Provider value={{
      announcements, activeAnnouncements, loading, error,
      fetchByRestaurant, fetchActive,
      createAnnouncement, updateAnnouncement, deleteAnnouncement,
    }}>
      {children}
    </AnnouncementContext.Provider>
  );
}

export const useAnnouncements = () => {
  const context = useContext(AnnouncementContext);
  if (!context) throw new Error('useAnnouncements must be used within AnnouncementProvider');
  return context;
};
