/**
 * Performance Monitoring and Optimization Utilities
 */

/**
 * Measure component render time
 */
export const measureRenderTime = (componentName: string) => {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (renderTime > 16.67) { // Slower than 60fps
      console.warn(`⚠️ ${componentName} render time: ${renderTime.toFixed(2)}ms (slow)`);
    }
    
    return renderTime;
  };
};

/**
 * Debounce function for performance
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for performance
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number = 300
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Lazy load images with Intersection Observer
 */
export const lazyLoadImage = (imageElement: HTMLImageElement): void => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });
    
    imageObserver.observe(imageElement);
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    imageElement.src = imageElement.dataset.src || '';
  }
};

/**
 * Preload critical resources
 */
export const preloadResource = (url: string, type: 'image' | 'script' | 'style' | 'font'): void => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = type;
  
  if (type === 'font') {
    link.crossOrigin = 'anonymous';
  }
  
  document.head.appendChild(link);
};

/**
 * Monitor Core Web Vitals
 */
export const measureWebVitals = (): void => {
  if (typeof window === 'undefined') return;

  // Largest Contentful Paint (LCP)
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log('LCP:', lastEntry.startTime);
  }).observe({ entryTypes: ['largest-contentful-paint'] });

  // First Input Delay (FID)
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry: any) => {
      const delay = entry.processingStart - entry.startTime;
      console.log('FID:', delay);
    });
  }).observe({ entryTypes: ['first-input'] });

  // Cumulative Layout Shift (CLS)
  let clsScore = 0;
  new PerformanceObserver((list) => {
    list.getEntries().forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        clsScore += entry.value;
      }
    });
    console.log('CLS:', clsScore);
  }).observe({ entryTypes: ['layout-shift'] });
};

/**
 * Cache API responses
 */
export class APICache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private ttl: number; // Time to live in milliseconds

  constructor(ttl: number = 5 * 60 * 1000) { // Default 5 minutes
    this.ttl = ttl;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check if expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}

/**
 * Optimize images
 */
export const optimizeImage = (url: string, width?: number, quality: number = 75): string => {
  // For Next.js Image component
  if (!url) return '';
  
  // If using CDN with image optimization
  // return `${url}?w=${width}&q=${quality}`;
  
  return url;
};

/**
 * Detect slow network
 */
export const isSlowNetwork = (): boolean => {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return false;
  }
  
  const connection = (navigator as any).connection;
  return connection?.effectiveType === 'slow-2g' || 
         connection?.effectiveType === '2g' ||
         connection?.saveData === true;
};

/**
 * Prefetch next page
 */
export const prefetchPage = (url: string): void => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
};

/**
 * Request Idle Callback wrapper
 */
export const requestIdleCallback = (callback: () => void): void => {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback);
  } else {
    setTimeout(callback, 1);
  }
};

/**
 * Batch DOM updates
 */
export const batchDOMUpdates = (updates: (() => void)[]): void => {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
};

/**
 * Memory cleanup
 */
export const cleanupMemory = (): void => {
  // Clear expired cache items
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        if (name.includes('old-')) {
          caches.delete(name);
        }
      });
    });
  }
  
  // Force garbage collection (if available)
  if ((window as any).gc) {
    (window as any).gc();
  }
};

/**
 * Monitor bundle size
 */
export const logBundleSize = (): void => {
  if (process.env.NODE_ENV === 'development') {
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;
    
    scripts.forEach(script => {
      const src = (script as HTMLScriptElement).src;
      fetch(src, { method: 'HEAD' })
        .then(response => {
          const size = parseInt(response.headers.get('content-length') || '0');
          totalSize += size;
          console.log(`📦 ${src.split('/').pop()}: ${(size / 1024).toFixed(2)}KB`);
        });
    });
    
    setTimeout(() => {
      console.log(`📦 Total bundle size: ${(totalSize / 1024).toFixed(2)}KB`);
    }, 2000);
  }
};

/**
 * Optimize React Query configuration
 */
export const optimizedQueryConfig = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 2,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
};

/**
 * Service Worker registration for PWA
 */
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered:', registration);
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  }
};

const performanceUtils = {
  measureRenderTime,
  debounce,
  throttle,
  lazyLoadImage,
  preloadResource,
  measureWebVitals,
  APICache,
  optimizeImage,
  isSlowNetwork,
  prefetchPage,
  requestIdleCallback,
  batchDOMUpdates,
  cleanupMemory,
  logBundleSize,
  optimizedQueryConfig,
  registerServiceWorker,
};

export default performanceUtils;
