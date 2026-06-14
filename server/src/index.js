require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { verifyToken } = require('./middleware/auth');
const restaurantRoutes = require('./routes/restaurantRoutes');
const tableRoutes = require('./routes/tableRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const menuItemRoutes = require('./routes/menuItemRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const restaurantHourRoutes = require('./routes/restaurantHourRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api', verifyToken);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/restaurant-hours', restaurantHourRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Yori Web App API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});