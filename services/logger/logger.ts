/**
 * Logger service that handles logging based on environment
 * In production, logs are suppressed to avoid performance impact
 * In development, logs are colorized and include timestamps
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LoggerOptions {
  module?: string;
  timestamp?: boolean;
}

class Logger {
  private module: string;
  private isDevelopment: boolean;

  constructor(options: LoggerOptions = {}) {
    this.module = options.module || 'App';
    this.isDevelopment = process.env.NODE_ENV !== 'production';
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${this.module}] [${level.toUpperCase()}] ${message}`;
  }

  private shouldLog(): boolean {
    return this.isDevelopment;
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog()) {
      console.info(this.formatMessage('info', message), ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog()) {
      console.warn(this.formatMessage('warn', message), ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog()) {
      console.error(this.formatMessage('error', message), ...args);
    }
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog()) {
      console.debug(this.formatMessage('debug', message), ...args);
    }
  }
}

// Create a default logger instance
const defaultLogger = new Logger();

// Export factory function to create loggers with custom options
export const createLogger = (options: LoggerOptions = {}): Logger => {
  return new Logger(options);
};

// Export default logger for convenience
export default defaultLogger;
