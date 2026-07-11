require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { verifyToken } = require('./middleware/auth');
const sanitizeInput = require('./middleware/sanitize');
const restaurantRoutes = require('./routes/restaurantRoutes');
const tableRoutes = require('./routes/tableRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const menuItemRoutes = require('./routes/menuItemRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const restaurantHourRoutes = require('./routes/restaurantHourRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const reportRoutes = require('./routes/reportRoutes');
const gdprRoutes = require('./routes/gdprRoutes');
const publicRoutes = require('./routes/publicRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const reconciliationRoutes = require('./routes/reconciliationRoutes');
const { startReminderScheduler } = require('./utils/bookingReminderScheduler');
const { startDataRetentionScheduler } = require('./utils/dataRetentionScheduler');
const { createSocketServer } = require('./socket/setup');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ['\'self\''],
      scriptSrc: ['\'self\''],
      styleSrc: ['\'self\'', '\'unsafe-inline\''],
      imgSrc: ['\'self\'', 'data:', 'https:'],
      mediaSrc: ['\'self\'', 'https:'],
      connectSrc: ['\'self\'', 'ws://localhost:3001'],
      fontSrc: ['\'self\''],
      objectSrc: ['\'none\''],
      frameSrc: ['\'none\''],
    },
  },
}));
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use(sanitizeInput);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts, try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Too many requests, try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter, authRoutes);

app.use('/assets/images', express.static(path.join(__dirname, '..', '..', 'resources', 'images')));

app.use('/api/public', apiLimiter, publicRoutes);

const authenticatedApi = [apiLimiter, verifyToken];
app.use('/api/restaurants', ...authenticatedApi, restaurantRoutes);
app.use('/api/tables', ...authenticatedApi, tableRoutes);
app.use('/api/bookings', ...authenticatedApi, bookingRoutes);
app.use('/api/menu-items', ...authenticatedApi, menuItemRoutes);
app.use('/api/orders', ...authenticatedApi, orderRoutes);
app.use('/api/users', ...authenticatedApi, userRoutes);
app.use('/api/receipts', ...authenticatedApi, receiptRoutes);
app.use('/api/restaurant-hours', ...authenticatedApi, restaurantHourRoutes);
app.use('/api/announcements', ...authenticatedApi, announcementRoutes);
app.use('/api/reports', ...authenticatedApi, reportRoutes);
app.use('/api/gdpr', ...authenticatedApi, gdprRoutes);
app.use('/api/audit-logs', ...authenticatedApi, auditLogRoutes);
app.use('/api/reconciliation', ...authenticatedApi, reconciliationRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Yori Web App API is running' });
});

createSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startReminderScheduler();
  startDataRetentionScheduler();
});