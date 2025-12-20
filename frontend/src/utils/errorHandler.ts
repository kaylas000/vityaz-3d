/**
 * Error Handler and Logger Utility
 */

enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 100;

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private addLog(level: LogLevel, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level,
      message,
      data,
    };

    this.logs.push(entry);

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    const consoleMethod = level === LogLevel.ERROR ? 'error' : 
                          level === LogLevel.WARN ? 'warn' :
                          level === LogLevel.DEBUG ? 'debug' : 'log';
    console[consoleMethod as keyof Console](
      `[${entry.timestamp}] ${level}: ${message}`,
      data
    );
  }

  debug(message: string, data?: any): void { this.addLog(LogLevel.DEBUG, message, data); }
  info(message: string, data?: any): void { this.addLog(LogLevel.INFO, message, data); }
  warn(message: string, data?: any): void { this.addLog(LogLevel.WARN, message, data); }
  error(message: string, data?: any): void { this.addLog(LogLevel.ERROR, message, data); }

  getLogs(): LogEntry[] { return [...this.logs]; }
  clearLogs(): void { this.logs = []; }
}

const logger = new Logger();
export { logger, Logger, LogLevel, type LogEntry };
