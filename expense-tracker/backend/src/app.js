const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const { rateLimit } = require('express-rate-limit');
const { verifyToken } = require('./utils/jwt');
const buildCspDirectives = require('./config/csp');
const { verifyCsrfToken } = require('./middleware/csrfMiddleware');

const errorHandler = require('./middleware/errorMiddleware');

const app = express();
app.set('trust proxy', 1);

const allowedOrigins = Array.from(
  new Set(
    [
      ...(process.env.CORS_ORIGINS || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
      process.env.FRONTEND_URL?.trim(),
    ].filter(Boolean),
  ),
);

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
app.use(helmet.contentSecurityPolicy(buildCspDirectives()));
app.use(morgan('dev'));
app.use(cookieParser(process.env.COOKIE_SECRET || undefined));
app.use((req, res, next) => {
  if (!req.id) {
    req.id = crypto.randomUUID();
  }
  res.setHeader('X-Request-Id', req.id);
  next();
});
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(verifyCsrfToken);

const getAccessTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }
  return null;
};

const isAuthenticatedRequest = (req) => {
  const token = getAccessTokenFromRequest(req);
  if (!token) {
    return false;
  }
  const decoded = verifyToken(token);
  return Boolean(decoded);
};

// Rate Limiting (only applies to unauthenticated requests)
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
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
const securityRoutes = require('./routes/securityRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/nlp', nlpRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/security', securityRoutes);

// SỬ DỤNG MIDDLEWARE XỬ LÝ LỖI (Phải ở CUỐI CÙNG)
// Sau tất cả các app.use() và routes
app.use(errorHandler);

module.exports = app;
