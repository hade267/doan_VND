const isProduction = process.env.NODE_ENV === 'production';

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getBaseCookieOptions = () => {
  const sameSite = (process.env.TOKEN_COOKIE_SAMESITE || 'lax').toLowerCase();
  return {
    httpOnly: true,
    secure: process.env.TOKEN_COOKIE_SECURE === 'true' || isProduction,
    sameSite,
    domain: process.env.TOKEN_COOKIE_DOMAIN || undefined,
  };
};

const getAccessTokenOptions = () => ({
  ...getBaseCookieOptions(),
  maxAge: toNumber(process.env.ACCESS_TOKEN_TTL_MIN, 15) * 60 * 1000,
  path: process.env.ACCESS_TOKEN_COOKIE_PATH || '/',
});

const getRefreshTokenOptions = () => ({
  ...getBaseCookieOptions(),
  maxAge: toNumber(process.env.REFRESH_TOKEN_TTL_DAYS, 7) * 24 * 60 * 60 * 1000,
  path: process.env.REFRESH_TOKEN_COOKIE_PATH || '/api/auth',
});

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, getAccessTokenOptions());
  res.cookie('refreshToken', refreshToken, getRefreshTokenOptions());
};

const clearAuthCookies = (res) => {
  res.clearCookie('accessToken', { ...getAccessTokenOptions(), maxAge: 0 });
  res.clearCookie('refreshToken', { ...getRefreshTokenOptions(), maxAge: 0 });
};

module.exports = {
  getAccessTokenOptions,
  getRefreshTokenOptions,
  setAuthCookies,
  clearAuthCookies,
};
