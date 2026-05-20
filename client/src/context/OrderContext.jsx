import { createContext, useContext, useState } from 'react';
import { orderService } from '../services/orderService';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getAll();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersByRestaurant = async (restaurantId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getByRestaurant(restaurantId);
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrdersByDate = async (restaurantId, date) => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getByDate(restaurantId, date);
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrder = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getById(id);
      setCurrentOrder(data);
      await fetchOrderItems(id);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const newOrder = await orderService.create(data);
      setOrders([...orders, newOrder]);
      setCurrentOrder(newOrder);
      setOrderItems([]);
      return newOrder;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (orderId, itemData) => {
    setError(null);
    try {
      const item = await orderService.addItem(orderId, itemData);
      setOrderItems([...orderItems, item]);
      await recalculateOrder(orderId);
      return item;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const fetchOrderItems = async (orderId) => {
    try {
      const data = await orderService.getItems(orderId);
      setOrderItems(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateItem = async (orderId, itemId, data) => {
    setError(null);
    try {
      const updated = await orderService.updateItem(orderId, itemId, data);
      setOrderItems(orderItems.map(item => item.id === itemId ? updated : item));
      await recalculateOrder(orderId);
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeItem = async (orderId, itemId) => {
    setError(null);
    try {
      await orderService.removeItem(orderId, itemId);
      setOrderItems(orderItems.filter(item => item.id !== itemId));
      await recalculateOrder(orderId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const recalculateOrder = async (orderId) => {
    try {
      const updated = await orderService.calculateTotals(orderId);
      setCurrentOrder(updated);
      setOrders(orders.map(o => o.id === orderId ? updated : o));
      return updated;
    } catch (err) {
      setError(err.message);
    }
  };

  const updateTip = async (orderId, tip) => {
    setError(null);
    try {
      const updated = await orderService.updateTip(orderId, tip);
      setCurrentOrder(updated);
      setOrders(orders.map(o => o.id === orderId ? updated : o));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const processPayment = async (orderId, paymentData) => {
    setLoading(true);
    setError(null);
    try {
      const payment = await orderService.processPayment(orderId, paymentData);
      return payment;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const closeOrder = async (orderId) => {
    setError(null);
    try {
      const updated = await orderService.closeOrder(orderId);
      setCurrentOrder(updated);
      setOrders(orders.map(o => o.id === orderId ? updated : o));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const splitOrder = async (orderId) => {
    setError(null);
    try {
      const updated = await orderService.splitOrder(orderId);
      setCurrentOrder(updated);
      setOrders(orders.map(o => o.id === orderId ? updated : o));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteOrder = async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      await orderService.delete(orderId);
      setOrders(orders.filter(o => o.id !== orderId));
      if (currentOrder?.id === orderId) {
        setCurrentOrder(null);
        setOrderItems([]);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <OrderContext.Provider value={{
      orders,
      currentOrder,
      orderItems,
      loading,
      error,
      fetchOrders,
      fetchOrdersByRestaurant,
      fetchOrdersByDate,
      fetchOrder,
      createOrder,
      addItem,
      fetchOrderItems,
      updateItem,
      removeItem,
      recalculateOrder,
      updateTip,
      processPayment,
      closeOrder,
      splitOrder,
      deleteOrder,
      setCurrentOrder,
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within OrderProvider');
  }
  return context;
}