import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { createClient } from 'redis';
import { Request, Response } from 'express';

/**
 * Initialize Redis client for rate limiting
 */
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.connect().catch((err) => {
  console.error('Redis connection error:', err);
});

/**
 * General API rate limiter
 * 100 requests per 15 minutes
 */
export const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

/**
 * Stricter limiter for authentication endpoints
 * 5 attempts per 15 minutes
 */
export const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:auth:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

/**
 * Game action limiter to prevent cheating
 * 60 actions per minute
 */
export const gameLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: 'Too many game actions, please slow down.',
  keyGenerator: (req: Request) => {
    // Rate limit per user ID if authenticated
    return req.user?.userId || req.ip || 'unknown';
  },
});

/**
 * Strict limiter for sensitive operations
 * 3 attempts per 5 minutes
 */
export const sensitiveOperationLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:sensitive:',
  }),
  windowMs: 5 * 60 * 1000,
  max: 3,
  message: 'Too many attempts to perform this sensitive operation.',
});
