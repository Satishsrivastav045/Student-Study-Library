const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const studentRoutes = require('./routes/studentRoutes');
const shiftRoutes = require('./routes/shiftRoutes');
const seatRoutes = require('./routes/seatRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// DB connect
connectDB();

// middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// routes
app.use('/api/students', studentRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

// server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
