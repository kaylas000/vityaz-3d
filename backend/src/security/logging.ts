import winston from 'winston';
import { Request } from 'express';

/**
 * Create Winston logger for security events
 */
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'vityaz-security' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/security.log' }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV === 'development') {
  securityLogger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

/**
 * Log security event
 */
export function logSecurityEvent(
  event: string,
  details: any,
  req?: Request
): void {
  const metadata = {
    event,
    ...details,
  };

  if (req) {
    metadata.ip = req.ip || req.socket.remoteAddress;
    metadata.userAgent = req.get('user-agent');
    metadata.userId = req.user?.userId;
  }

  securityLogger.info(metadata);
}

/**
 * Log security error
 */
export function logSecurityError(
  error: string,
  details: any,
  req?: Request
): void {
  const metadata = {
    error,
    ...details,
  };

  if (req) {
    metadata.ip = req.ip || req.socket.remoteAddress;
    metadata.userAgent = req.get('user-agent');
    metadata.userId = req.user?.userId;
  }

  securityLogger.error(metadata);
}

/**
 * Log failed authentication
 */
export function logFailedAuth(username: string, req: Request): void {
  logSecurityEvent('failed_auth_attempt', { username }, req);
}

/**
 * Log successful authentication
 */
export function logSuccessfulAuth(userId: number, req: Request): void {
  logSecurityEvent('successful_auth', { userId }, req);
}

/**
 * Log suspicious activity
 */
export function logSuspiciousActivity(
  activity: string,
  details: any,
  req: Request
): void {
  logSecurityEvent('suspicious_activity', { activity, ...details }, req);
}
