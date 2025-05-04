// server/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const config = require('./config');
const authRoutes = require('./routes/auth');

// Initialize Express app
const app = express();

// Enhanced CORS configuration to allow all origins for testing
app.use(cors({
  origin: '*', // This is less secure but good for testing
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Simplified helmet for testing
app.use(helmet({ 
  contentSecurityPolicy: false, 
  crossOriginEmbedderPolicy: false 
}));


// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitMax,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Parse JSON body
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Simple test endpoint
app.get('/test', (req, res) => {
  res.send('Server is running!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express error:', err);
  
  // Make sure we don't send the response multiple times
  if (res.headersSent) {
    return next(err);
  }
  
  // Send a clean JSON response
  res.status(500).json({
    status: 'error',
    message: config.nodeEnv === 'production' ? 'Internal server error' : err.message
  });
});

// Debug logging
console.log('Starting server...');
console.log('Config loaded:', {
  port: config.port,
  nodeEnv: config.nodeEnv,
  corsOrigins: config.corsOrigins,
  hasAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
  hasAccountSid: !!process.env.TWILIO_ACCOUNT_SID,
  hasVerifyServiceSid: !!process.env.TWILIO_VERIFY_SERVICE_SID
});

// Start server
const PORT = config.port || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Log any server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

module.exports = app; // For testing