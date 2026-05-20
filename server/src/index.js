require('dotenv').config();
const express = require('express');
const cors = require('cors');
const restaurantRoutes = require('./routes/restaurantRoutes');
const tableRoutes = require('./routes/tableRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const menuItemRoutes = require('./routes/menuItemRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/restaurants', restaurantRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Yori Web App API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});