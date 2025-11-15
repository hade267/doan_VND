const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const hpp = require('hpp');
const { clean } = require('xss-clean/lib/xss');
const { rateLimit } = require('express-rate-limit');
const Sentry = require('@sentry/node');
const pinoHttp = require('pino-http');
const { verifyToken } = require('./utils/jwt');
const logger = require('./utils/logger');

// Import middleware xử lý lỗi (Giả sử bạn đặt tên tệp là errorMiddleware.js)
const errorHandler = require('./middleware/errorMiddleware');

const app = express();
app.set('trust proxy', 1);

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.2),
  });
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// Middleware
const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: allowedOrigins.length
    ? (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
      }
    : true,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'same-site' },
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(hpp());
app.use(
  pinoHttp({
    logger,
    customLogLevel: (res, err) => {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
  }),
);
const sanitizePayload = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizePayload);
  }
  if (value && typeof value === 'object') {
    Object.keys(value).forEach((key) => {
      value[key] = sanitizePayload(value[key]);
    });
    return value;
  }
  if (typeof value === 'string') {
    return clean(value);
  }
  return value;
};

app.use((req, res, next) => {
  if (req.body) {
    req.body = sanitizePayload(req.body);
  }
  if (req.params) {
    req.params = sanitizePayload(req.params);
  }
  if (req.query) {
    req.query = sanitizePayload(req.query);
  }
  next();
});
app.use(cookieParser());

const isAuthenticatedRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  return Boolean(decoded);
};

// Rate Limiting (only applies to unauthenticated requests)
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per window (here, per 15 minutes).
	standardHeaders: 'draft-7',
	legacyHeaders: false,
	skip: (req) => isAuthenticatedRequest(req),
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many authentication attempts. Please try again later.',
});
app.use('/api/auth', authLimiter);

const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many admin requests. Please slow down.',
});
app.use('/api/admin', adminLimiter);


// Basic route for testing
app.get('/', (req, res) => {
  res.status(200).json({ message: '👋 Welcome to the Expense Tracker API!' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// API Routes
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const reportRoutes = require('./routes/reportRoutes');
const nlpRoutes = require('./routes/nlpRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/nlp', nlpRoutes);
app.use('/api/admin', adminRoutes);

if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}


// SỬ DỤNG MIDDLEWARE XỬ LÝ LỖI (Phải ở CUỐI CÙNG)
// Sau tất cả các app.use() và routes
app.use(errorHandler);

module.exports = app;

