// Request logging middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  
  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 500 ? '\x1b[31m' : // Red for 5xx
                        res.statusCode >= 400 ? '\x1b[33m' : // Yellow for 4xx
                        res.statusCode >= 300 ? '\x1b[36m' : // Cyan for 3xx
                        '\x1b[32m'; // Green for 2xx
    
    console.log(
      `${statusColor}[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms\x1b[0m`
    );
  });
  
  next();
};

// Error logger middleware
export const errorLogger = (err, req, res, next) => {
  console.error('\x1b[31m[ERROR]\x1b[0m', {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  next(err);
};

