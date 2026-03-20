const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean).map(url => url.replace(/\/$/, "")); // Remove trailing slash

console.log('🔒 CORS Allowed Origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/', (req, res) => res.json({ status: 'API is running' }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/bills', require('./routes/billRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/labtests', require('./routes/labTestRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

// Connect DB and start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MongoDB URI is not defined in environment variables');
  process.exit(1);
} else {
  // Mask URI for security in logs
  const maskedUri = MONGO_URI.replace(/:([^@]+)@/, ':****@');
  console.log(`📡 Attempting to connect to MongoDB: ${maskedUri}`);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    if (err.message.includes('whitelist')) {
      console.error('💡 TIP: Check your MongoDB Atlas Network Access whitelist. You likely need to allow access from 0.0.0.0/0 for Render.');
    }
    process.exit(1);
  });
