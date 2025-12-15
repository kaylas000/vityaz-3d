import DOMPurify from 'isomorphic-dompurify';
import { escape } from 'html-escaper';

/**
 * Sanitize HTML content - remove all tags
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Escape HTML entities
 */
export function escapeHtml(text: string): string {
  return escape(text);
}

/**
 * Sanitize username
 */
export function sanitizeUsername(username: string): string {
  return username.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 20);
}

/**
 * Sanitize email
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(value: any): number {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Sanitize for NoSQL injection
 */
export function sanitizeNoSQL(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeNoSQL);
  }

  const sanitized: any = {};
  for (const key in obj) {
    // Remove keys starting with $ (MongoDB operators)
    if (key.startsWith('$')) continue;
    sanitized[key] = sanitizeNoSQL(obj[key]);
  }
  return sanitized;
}
