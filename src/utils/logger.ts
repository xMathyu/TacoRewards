import winston from 'winston';

/**
 * Configure Winston logger for the application
 */
const logger = winston.createLogger({
  level: process.env['LOG_LEVEL'] || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.colorize(),
    winston.format.printf(info => {
      return `${info['timestamp'] as string} [${info.level}]: ${(info['stack'] as string) || info.message}`;
    }),
  ),
  defaultMeta: { service: 'tacobot' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),

    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),

    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
  ],
});

// If we're in production, only log to files
if (process.env['NODE_ENV'] === 'production') {
  const consoleTransport = logger.transports[0];
  if (consoleTransport) {
    logger.remove(consoleTransport); // Remove console transport
  }
}

export { logger };
