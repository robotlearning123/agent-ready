/**
 * Logger utility using pino for structured logging
 * Provides consistent logging across the application
 */

import pino from 'pino';

const isDevelopment = process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: {
    app: 'agent-ready',
    version: '0.0.1',
  },
});

// Create child loggers for different modules
export const scannerLogger = logger.child({ module: 'scanner' });
export const checkLogger = logger.child({ module: 'checks' });
export const engineLogger = logger.child({ module: 'engine' });
export const profileLogger = logger.child({ module: 'profiles' });

export default logger;
