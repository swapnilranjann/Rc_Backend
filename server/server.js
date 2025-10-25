import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import dotenv from 'dotenv';
import passport from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import postRoutes from './routes/postRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import followRoutes from './routes/followRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import successStoryRoutes from './routes/successStoryRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import { requestLogger, errorLogger } from './middleware/logger.js';

// Load environment variables
dotenv.config();

const app = express();

// Request logging middleware (in development)
if (process.env.NODE_ENV !== 'production') {
  app.use(requestLogger);
}

// CORS configuration (MUST be before other middleware)
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:3000', 'null'], // Allow file:// protocol
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting (more lenient in development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Higher limit in development
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for preflight requests
  skip: (req) => req.method === 'OPTIONS'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'fallback-secret-key-for-dev',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bike-community', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('🚀 Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/communities', communityRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/success-stories', successStoryRoutes);
app.use('/api/contact', contactRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Bike Community Platform API is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorLogger);
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ 
    success: false,
    message: err.message || 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.stack : 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🏍️ Bike Community Platform server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
