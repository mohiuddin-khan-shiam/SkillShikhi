// services/loggerService.js

import config from '../config';

/**
 * Log levels
 * @enum {number}
 */
const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

/**
 * Current log level based on environment
 */
const currentLogLevel = config.server.isProduction ? LogLevel.INFO : LogLevel.DEBUG;

/**
 * Format a log message with timestamp and additional info
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} [data] - Additional data to log
 * @returns {string} Formatted log message
 */
function formatLogMessage(level, message, data) {
  const timestamp = new Date().toISOString();
  let formattedMessage = `[${timestamp}] [${level}] ${message}`;
  
  if (data) {
    try {
      const dataString = typeof data === 'object' 
        ? JSON.stringify(data, null, 2) 
        : data.toString();
      formattedMessage += `\n${dataString}`;
    } catch (error) {
      formattedMessage += '\n[Error formatting log data]';
    }
  }
  
  return formattedMessage;
}

/**
 * Log an error message
 * @param {string} message - Error message
 * @param {Error|Object} [error] - Error object or additional data
 */
export function error(message, error) {
  if (currentLogLevel >= LogLevel.ERROR) {
    console.error(formatLogMessage('ERROR', message, error));
  }
}

/**
 * Log a warning message
 * @param {string} message - Warning message
 * @param {Object} [data] - Additional data
 */
export function warn(message, data) {
  if (currentLogLevel >= LogLevel.WARN) {
    console.warn(formatLogMessage('WARN', message, data));
  }
}

/**
 * Log an info message
 * @param {string} message - Info message
 * @param {Object} [data] - Additional data
 */
export function info(message, data) {
  if (currentLogLevel >= LogLevel.INFO) {
    console.log(formatLogMessage('INFO', message, data));
  }
}

/**
 * Log a debug message
 * @param {string} message - Debug message
 * @param {Object} [data] - Additional data
 */
export function debug(message, data) {
  if (currentLogLevel >= LogLevel.DEBUG) {
    console.log(formatLogMessage('DEBUG', message, data));
  }
}

/**
 * Create a logger for a specific module
 * @param {string} moduleName - Name of the module
 * @returns {Object} Logger object with error, warn, info, and debug methods
 */
export function createLogger(moduleName) {
  return {
    error: (message, error) => {
      this.error(`[${moduleName}] ${message}`, error);
    },
    warn: (message, data) => {
      this.warn(`[${moduleName}] ${message}`, data);
    },
    info: (message, data) => {
      this.info(`[${moduleName}] ${message}`, data);
    },
    debug: (message, data) => {
      this.debug(`[${moduleName}] ${message}`, data);
    },
  };
}

export default {
  error,
  warn,
  info,
  debug,
  createLogger,
};
