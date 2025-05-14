// config/index.js

/**
 * Application configuration
 * Centralizes all environment variables and configuration settings
 */
const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
  },
  
  // Database configuration
  database: {
    uri: process.env.MONGODB_URI,
    name: process.env.MONGODB_DB,
  },
  
  // Authentication configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    bcryptSaltRounds: 10,
  },
  
  // Email configuration
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'SkillShikhi <noreply@skillshikhi.com>',
  },
  
  // Cloudinary configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  
  // Application settings
  app: {
    name: 'SkillShikhi',
    baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    defaultPageSize: 10,
    maxPageSize: 50,
  },
};

export default config;
