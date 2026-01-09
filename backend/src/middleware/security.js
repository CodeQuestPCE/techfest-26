const validator = require('validator');

/**
 * Sanitize user input to prevent XSS attacks
 */
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    // Escape HTML entities
    return validator.escape(input.trim());
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  return validator.isEmail(email);
};

/**
 * Validate phone number
 */
const isValidPhone = (phone) => {
  return validator.isMobilePhone(phone, 'any');
};

/**
 * Validate URL
 */
const isValidURL = (url) => {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true
  });
};

/**
 * Validate MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  return validator.isMongoId(id);
};

/**
 * Sanitize filename to prevent path traversal
 */
const sanitizeFilename = (filename) => {
  // Remove path components and dangerous characters
  return filename
    .replace(/^.*[\\\/]/, '') // Remove path
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace dangerous chars
    .slice(0, 255); // Limit length
};

/**
 * Password strength validator
 */
const isStrongPassword = (password) => {
  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0
  });
};

/**
 * Middleware to sanitize request body
 */
const sanitizeRequest = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  if (req.query) {
    req.query = sanitizeInput(req.query);
  }
  if (req.params) {
    req.params = sanitizeInput(req.params);
  }
  next();
};

/**
 * Prevent HTTP Parameter Pollution attacks
 */
const preventHPP = (whitelist = []) => {
  return (req, res, next) => {
    if (req.query) {
      for (const key in req.query) {
        if (Array.isArray(req.query[key]) && !whitelist.includes(key)) {
          req.query[key] = req.query[key][0];
        }
      }
    }
    next();
  };
};

/**
 * Security headers middleware
 */
const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS filter in browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // HSTS - Force HTTPS (only in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
};

/**
 * Request size limiter to prevent DoS
 */
const limitRequestSize = (maxSize = '10kb') => {
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxBytes = parseSize(maxSize);
    
    if (contentLength > maxBytes) {
      return res.status(413).json({
        success: false,
        message: 'Request entity too large'
      });
    }
    next();
  };
};

/**
 * Convert size string to bytes
 */
const parseSize = (size) => {
  const units = { b: 1, kb: 1024, mb: 1024 * 1024, gb: 1024 * 1024 * 1024 };
  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*([kmg]?b)$/);
  if (!match) return 0;
  return parseFloat(match[1]) * units[match[2]];
};

/**
 * Detect and block suspicious patterns
 */
const detectSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    /<script>/i,
    /javascript:/i,
    /on\w+=/i, // Event handlers like onclick=
    /\.\.\//,  // Path traversal
    /\/etc\/passwd/i,
    /union.*select/i, // SQL injection
    /drop.*table/i,   // SQL injection
  ];
  
  const checkString = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params
  });
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(checkString)) {
      console.warn(`⚠️  Suspicious activity detected: ${pattern} from IP: ${req.ip}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid request detected'
      });
    }
  }
  
  next();
};

/**
 * Log security events
 */
const logSecurityEvent = (event, req, details = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    method: req.method,
    path: req.path,
    userId: req.user?.id || 'anonymous',
    ...details
  };
  
  console.log('🔒 Security Event:', JSON.stringify(logEntry));
  
  // In production, send to monitoring service
  // e.g., Sentry, Datadog, CloudWatch
};

module.exports = {
  sanitizeInput,
  isValidEmail,
  isValidPhone,
  isValidURL,
  isValidObjectId,
  sanitizeFilename,
  isStrongPassword,
  sanitizeRequest,
  preventHPP,
  securityHeaders,
  limitRequestSize,
  detectSuspiciousActivity,
  logSecurityEvent
};
