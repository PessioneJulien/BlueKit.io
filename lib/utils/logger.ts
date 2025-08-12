/**
 * Production-safe logger utility for BlueKit.io
 * Provides conditional logging based on environment
 */

interface Logger {
  dev: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  debug: (...args: any[]) => void;
}

/**
 * Logger instance with environment-based conditional logging
 */
export const logger: Logger = {
  /**
   * Development-only logs - only shown in development mode
   */
  dev: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEV]', ...args);
    }
  },

  /**
   * Info logs - shown in development and staging
   */
  info: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * Warning logs - always shown
   */
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },

  /**
   * Error logs - always shown
   */
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },

  /**
   * Debug logs - only shown in development mode
   */
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[DEBUG]', ...args);
    }
  }
};

/**
 * Legacy console methods for easy migration
 */
export const console_dev = logger.dev;
export const console_info = logger.info;
export const console_warn = logger.warn;
export const console_error = logger.error;
export const console_debug = logger.debug;