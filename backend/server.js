const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const validateEnv = require('./utils/envChecker');

// Load env vars
dotenv.config();

// Validate critical environment variables for production readiness
// validateEnv(); // Disabled for local development when .env may not exist

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});


// Security Middleware
// In your backend server.js / app.js
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));

// Rate limiting (100 requests per 10 mins)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 100
});
app.use('/api', limiter);

// Prevent NoSQL injections
app.use(mongoSanitize());

// Routes Imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const loyaltyRoutes = require('./routes/loyaltyRoutes');
const couponRoutes = require('./routes/couponRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const supportRoutes = require('./routes/supportRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Prevent XSS attacks
app.use(xss());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Attach io to request object for controllers to use
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Base Route
app.get('/', (req, res) => {
  res.send('Smart Hotel Booking API is running...');
});


// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/admin', adminRoutes);

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  socket.on('join_room', (room) => {
    socket.join(room);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error Handling Middleware
const notFoundMiddleware = require('./middleware/notFoundMiddleware');
const errorHandler = require('./middleware/errorMiddleware');

app.use(notFoundMiddleware);
app.use(errorHandler);

// Initialize Background Cron Jobs
const { initCronJobs } = require('./services/cronService');
initCronJobs();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Trigger nodemon restart 2
