import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useRestaurants } from './RestaurantContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { isAuthenticated, getToken } = useAuth();
  const { selectedRestaurantId } = useRestaurants();
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const currentToken = getToken();
    if (!isAuthenticated || !currentToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    const socket = io('http://localhost:3001', {
      auth: { token: currentToken },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('[socket] Connected');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[socket] Disconnected');
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('[socket] Connection error:', err.message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [isAuthenticated, getToken]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !connected || !selectedRestaurantId) return;

    socket.emit('join:restaurant', selectedRestaurantId);

    return () => {
      socket.emit('leave:restaurant', selectedRestaurantId);
    };
  }, [selectedRestaurantId, connected]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
