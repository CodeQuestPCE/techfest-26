/**
 * Frontend Security Utilities
 * Protect against XSS, CSRF, and other client-side attacks
 */

/**
 * Sanitize HTML to prevent XSS
 */
export const sanitizeHTML = (html: string): string => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

/**
 * Escape special characters in user input
 */
export const escapeHTML = (text: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Validate and sanitize URL
 */
export const sanitizeURL = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null;
    }
    return urlObj.toString();
  } catch {
    return null;
  }
};

/**
 * Secure localStorage with encryption
 */
export const secureStorage = {
  setItem: (key: string, value: any, encrypt = false): void => {
    try {
      const stringValue = JSON.stringify(value);
      const finalValue = encrypt ? btoa(stringValue) : stringValue;
      localStorage.setItem(key, finalValue);
    } catch (error) {
      console.error('Error storing data:', error);
    }
  },

  getItem: (key: string, decrypt = false): any => {
    try {
      const value = localStorage.getItem(key);
      if (!value) return null;
      const finalValue = decrypt ? atob(value) : value;
      return JSON.parse(finalValue);
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
};

/**
 * CSRF Token management
 */
export const csrfToken = {
  get: (): string | null => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || null;
  },

  generate: (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

/**
 * Strong password validation
 */
export const isStrongPassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Detect and prevent injection attacks in input
 */
export const isSafeInput = (input: string): boolean => {
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /\.\.\//,
    /\/etc\/passwd/i,
  ];

  return !dangerousPatterns.some(pattern => pattern.test(input));
};

/**
 * Rate limiting on client side
 */
export class ClientRateLimiter {
  private attempts: { [key: string]: number[] } = {};
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60000 // 1 minute
  ) {}

  canProceed(key: string): boolean {
    const now = Date.now();
    
    // Initialize if doesn't exist
    if (!this.attempts[key]) {
      this.attempts[key] = [];
    }

    // Remove old attempts outside the window
    this.attempts[key] = this.attempts[key].filter(
      timestamp => now - timestamp < this.windowMs
    );

    // Check if under limit
    if (this.attempts[key].length >= this.maxAttempts) {
      return false;
    }

    // Add current attempt
    this.attempts[key].push(now);
    return true;
  }

  reset(key: string): void {
    delete this.attempts[key];
  }
}

/**
 * Content Security Policy violation reporter
 */
export const setupCSPReporting = (): void => {
  if (typeof window !== 'undefined') {
    document.addEventListener('securitypolicyviolation', (e) => {
      console.error('CSP Violation:', {
        blockedURI: e.blockedURI,
        violatedDirective: e.violatedDirective,
        originalPolicy: e.originalPolicy,
      });

      // Send to analytics/monitoring service in production
      if (process.env.NODE_ENV === 'production') {
        // Example: sendToMonitoring(e);
      }
    });
  }
};

/**
 * Secure cookie management
 */
export const secureCookie = {
  set: (name: string, value: string, days: number = 7): void => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/; SameSite=Strict${secure}`;
  },

  get: (name: string): string | null => {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  delete: (name: string): void => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
};

/**
 * Prevent clickjacking
 */
export const preventClickjacking = (): void => {
  if (typeof window !== 'undefined') {
    if (window.top !== window.self) {
      // Page is in an iframe
      console.warn('Page loaded in iframe - potential clickjacking attempt');
      // Optionally break out of frame
      // window.top.location = window.self.location;
    }
  }
};

/**
 * Detect browser fingerprinting attempts
 */
export const detectFingerprinting = (): void => {
  if (typeof window !== 'undefined') {
    const originalCanvasToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function(...args) {
      console.warn('Canvas fingerprinting attempt detected');
      return originalCanvasToDataURL.apply(this, args);
    };
  }
};

/**
 * Initialize all security measures
 */
export const initializeSecurity = (): void => {
  if (typeof window !== 'undefined') {
    setupCSPReporting();
    preventClickjacking();
    
    // Disable right-click in production (optional)
    if (process.env.NODE_ENV === 'production') {
      // document.addEventListener('contextmenu', (e) => e.preventDefault());
    }
  }
};

export default {
  sanitizeHTML,
  escapeHTML,
  sanitizeURL,
  secureStorage,
  csrfToken,
  isValidEmail,
  isValidPhone,
  isStrongPassword,
  isSafeInput,
  ClientRateLimiter,
  setupCSPReporting,
  secureCookie,
  preventClickjacking,
  initializeSecurity,
};
