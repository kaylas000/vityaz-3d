import cors from 'cors';

/**
 * Configure CORS - only allow trusted origins
 */
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'https://vityaz.vercel.app',
  'https://vityaz-game.netlify.app',
];

// Allow localhost in development
if (process.env.NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:5173');
  allowedOrigins.push('http://127.0.0.1:5173');
  allowedOrigins.push('http://localhost:3000');
}

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['Content-Length', 'X-JSON-Response'],
  maxAge: 86400, // 24 hours
};

export function setupCors(app: any): void {
  app.use(cors(corsOptions));
}
