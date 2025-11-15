const crypto = require('crypto');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const CSRF_COOKIE_NAME = process.env.CSRF_COOKIE_NAME || 'csrfToken';
const CSRF_HEADER_NAME = (process.env.CSRF_HEADER_NAME || 'x-csrf-token').toLowerCase();
const sameSite = (process.env.CSRF_COOKIE_SAMESITE || 'strict').toLowerCase();

const getCsrfCookieOptions = () => ({
  httpOnly: false,
  secure: process.env.TOKEN_COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
  sameSite,
  path: '/',
});

const generateCsrfToken = () => crypto.randomBytes(32).toString('hex');

const attachCsrfToken = (req, res) => {
  const token = generateCsrfToken();
  res.cookie(CSRF_COOKIE_NAME, token, getCsrfCookieOptions());
  res.json({ csrfToken: token });
};

const verifyCsrfToken = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
  const headerToken =
    req.get(CSRF_HEADER_NAME) ||
    req.headers[CSRF_HEADER_NAME] ||
    req.body?._csrf ||
    req.body?.csrfToken;

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ message: 'Invalid CSRF token. Please refresh and try again.' });
  }

  return next();
};

module.exports = {
  attachCsrfToken,
  verifyCsrfToken,
};
