import dotenv from 'dotenv';

dotenv.config();

const config = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/bike-community',
  
  // Authentication
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: '30d',
  sessionSecret: process.env.SESSION_SECRET,
  
  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
  
  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // CORS
  corsOrigins: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://your-domain.com']
    : ['http://localhost:3000', 'http://localhost:5000', 'null'],
  
  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 200 // requests per windowMs
  },
  
  // File Upload
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  
  // Pagination
  pagination: {
    defaultLimit: 20,
    maxLimit: 100
  }
};

// Validate required config
const requiredConfig = ['jwtSecret'];

for (const key of requiredConfig) {
  if (!config[key.replace(/([A-Z])/g, '_$1').toLowerCase()]) {
    throw new Error(`Missing required environment variable: ${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`);
  }
}

export default config;

