const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/database');
const { apiLimiter } = require('./middleware/rateLimiter');
const {
  sanitizeRequest,
  securityHeaders,
  detectSuspiciousActivity
} = require('./middleware/security');
const {
  authLimiter,
  passwordResetLimiter,
  registrationLimiter,
  paymentLimiter
} = require('./middleware/advancedRateLimiter');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS configuration - must be before other middleware
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.FRONTEND_URL || 'https://your-app.onrender.com']
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression middleware - must be early in the stack
app.use(compression({
  level: 6, // Compression level (0-9)
  threshold: 1024, // Only compress responses larger than 1KB
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "http://localhost:3000", "http://localhost:3001"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "http://localhost:3000", "http://localhost:5000"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Additional security headers
app.use(securityHeaders);

// Prevent MongoDB injection
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`⚠️  Sanitized ${key} in request from ${req.ip}`);
  }
}));

// Prevent HTTP Parameter Pollution
app.use(hpp({
  whitelist: ['tags', 'category', 'status', 'sort'] // Allow arrays for these params
}));

// Cookie parser with security options
app.use(cookieParser());

// Body parser with size limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 50 // Limit URL parameters
}));

// Sanitize all user inputs
app.use(sanitizeRequest);

// Detect suspicious activity
app.use(detectSuspiciousActivity);

// General API rate limiting
app.use('/api/', apiLimiter);

// Serve static files with CORS headers
app.use('/uploads', (req, res, next) => {
  // Only allow requests from configured origins
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static('uploads'));

app.use('/certificates', (req, res, next) => {
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static('certificates'));

// Routes with specific rate limiters
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forgotpassword', passwordResetLimiter);
app.use('/api/auth/resetpassword', passwordResetLimiter);
app.use('/api/auth', require('./routes/auth'));

app.use('/api/users', require('./routes/users'));

app.use('/api/events', require('./routes/events'));

app.use('/api/registrations', registrationLimiter);
app.use('/api/registrations', require('./routes/registrations'));

app.use('/api/tickets', require('./routes/tickets'));

app.use('/api/payments', paymentLimiter);
app.use('/api/payments', require('./routes/payments'));

app.use('/api/admin', require('./routes/admin'));

app.use('/api/checkin', require('./routes/checkin'));

app.use('/api/certificates', require('./routes/certificates'));

app.use('/api/ambassadors', require('./routes/ambassadors'));

app.use('/api/logs', require('./routes/logs'));

app.use('/api/settings', require('./routes/settings'));

// Serve static frontend files (must be after API routes)
const frontendPath = path.join(__dirname, '../../frontend/out');
app.use(express.static(frontendPath));

// Handle client-side routing - send all non-API requests to index.html
app.get('*', (req, res) => {
  // Don't handle API routes here
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'API route not found'
    });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Health check with caching
app.get('/api/health', (req, res) => {
  res.set('Cache-Control', 'public, max-age=60'); // Cache for 1 minute
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
