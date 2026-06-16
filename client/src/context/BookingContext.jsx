import { createContext, useContext, useState } from 'react';
import { bookingService } from '../services/bookingService';

const BookingContext = createContext();

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.getAll();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingsByRestaurant = async (restaurantId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.getByRestaurant(restaurantId);
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingsByDate = async (restaurantId, date) => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.getByDate(restaurantId, date);
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingsByStatus = async (restaurantId, status) => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.getByStatus(restaurantId, status);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchWalkIns = async (restaurantId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingService.getWalkIns(restaurantId);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const newBooking = await bookingService.create(data);
      setBookings([...bookings, newBooking]);
      return newBooking;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBooking = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await bookingService.update(id, data);
      setBookings(bookings.map(b => b.id === id ? updated : b));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (id, status) => {
    setError(null);
    try {
      const updated = await bookingService.updateStatus(id, status);
      setBookings(bookings.map(b => b.id === id ? updated : b));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const seatCustomer = async (id) => {
    setError(null);
    try {
      const updated = await bookingService.seatCustomer(id);
      setBookings(bookings.map(b => b.id === id ? updated : b));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getBookingTables = async (bookingId) => {
    setError(null);
    try {
      return await bookingService.getBookingTables(bookingId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const addBookingTable = async (bookingId, tableId) => {
    setError(null);
    try {
      const record = await bookingService.addBookingTable(bookingId, tableId);
      return record;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeBookingTable = async (bookingId, tableId) => {
    setError(null);
    try {
      await bookingService.removeBookingTable(bookingId, tableId);
      return { success: true };
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const completeBooking = async (id) => {
    setError(null);
    try {
      const updated = await bookingService.completeBooking(id);
      setBookings(bookings.map(b => b.id === id ? updated : b));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const extendBooking = async (id, newEndTime, employeeId) => {
    setError(null);
    try {
      const updated = await bookingService.extendBooking(id, newEndTime, employeeId);
      setBookings(bookings.map(b => b.id === id ? updated : b));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteBooking = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await bookingService.delete(id);
      setBookings(bookings.filter(b => b.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <BookingContext.Provider value={{
      bookings,
      loading,
      error,
      fetchBookings,
      fetchBookingsByRestaurant,
      fetchBookingsByDate,
      fetchBookingsByStatus,
      fetchWalkIns,
      createBooking,
      updateBooking,
      updateBookingStatus,
      seatCustomer,
      getBookingTables,
      addBookingTable,
      removeBookingTable,
      completeBooking,
      extendBooking,
      deleteBooking,
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBookings() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookings must be used within BookingProvider');
  }
  return context;
}