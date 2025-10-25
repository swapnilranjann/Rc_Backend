// Production-ready logger utility
const isProduction = process.env.NODE_ENV === 'production';

const logger = {
  info: (message, ...args) => {
    if (!isProduction) {
      console.log(`ℹ️  [INFO] ${message}`, ...args);
    }
  },

  success: (message, ...args) => {
    console.log(`✅ [SUCCESS] ${message}`, ...args);
  },

  error: (message, error) => {
    console.error(`❌ [ERROR] ${message}`, error?.message || error);
    if (!isProduction && error?.stack) {
      console.error(error.stack);
    }
  },

  warn: (message, ...args) => {
    console.warn(`⚠️  [WARN] ${message}`, ...args);
  },

  debug: (message, ...args) => {
    if (!isProduction) {
      console.debug(`🔍 [DEBUG] ${message}`, ...args);
    }
  }
};

export default logger;

