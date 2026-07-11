const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const { JWT_SECRET } = require('../middleware/auth');

let io = null;

function createSocketServer(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:5173'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.getById(decoded.userId);
      if (!user) {
        return next(new Error('User not found'));
      }
      socket.user = user;
      next();
    } catch (_) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[socket] ${socket.user.name} connected (${socket.id})`);

    socket.on('join:restaurant', (restaurantId) => {
      if (!restaurantId) return;
      const roomName = `restaurant:${restaurantId}`;
      socket.join(roomName);
      console.log(`[socket] ${socket.user.name} joined room ${roomName}`);
    });

    socket.on('leave:restaurant', (restaurantId) => {
      if (!restaurantId) return;
      const roomName = `restaurant:${restaurantId}`;
      socket.leave(roomName);
      console.log(`[socket] ${socket.user.name} left room ${roomName}`);
    });

    socket.on('disconnect', () => {
      console.log(`[socket] ${socket.user.name} disconnected (${socket.id})`);
    });
  });

  console.log('[socket] Socket.IO server initialized');
  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call createSocketServer first.');
  }
  return io;
}

function emitToRestaurant(restaurantId, event, data) {
  const socketIO = getIO();
  socketIO.to(`restaurant:${restaurantId}`).emit(event, data);
}

function emitTableUpdate(restaurantId, table) {
  emitToRestaurant(restaurantId, 'table:updated', table);
}

function emitBookingUpdate(restaurantId, booking) {
  emitToRestaurant(restaurantId, 'booking:updated', booking);
}

function emitOrderUpdate(restaurantId, order) {
  emitToRestaurant(restaurantId, 'order:updated', order);
}

function emitAnnouncementUpdate(restaurantId, announcement) {
  emitToRestaurant(restaurantId, 'announcement:new', announcement);
}

module.exports = { createSocketServer, getIO, emitToRestaurant, emitTableUpdate, emitBookingUpdate, emitOrderUpdate, emitAnnouncementUpdate };
