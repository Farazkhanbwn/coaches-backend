import rateLimit from 'express-rate-limit';

// General API rate limiter - 100 requests per 15 minutes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

// Strict limiter for auth routes - 5 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per window per IP
  message: 'Too many login attempts, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Create/Update operations - 20 requests per 15 minutes
export const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 create/update operations per window per IP
  message: 'Too many create/update requests, please slow down.',
  standardHeaders: true,
  legacyHeaders: false,
});
