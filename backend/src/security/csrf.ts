import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import { Express, Request, Response } from 'express';

/**
 * CSRF protection middleware
 */
export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
});

/**
 * Setup CSRF protection
 */
export function setupCsrf(app: Express): void {
  app.use(cookieParser());
  app.use(csrfProtection);

  // Endpoint to get CSRF token
  app.get('/api/csrf-token', (req: Request, res: Response) => {
    res.json({ csrfToken: req.csrfToken() });
  });
}
