const crypto = require('crypto');
const bcrypt = require('bcrypt');
const dayjs = require('dayjs');
const { RefreshToken } = require('../models');

const COOKIE_NAME = process.env.REFRESH_TOKEN_COOKIE_NAME || 'rt';
const COOKIE_PATH = process.env.REFRESH_TOKEN_COOKIE_PATH || '/api/auth/refresh';
const DEFAULT_REFRESH_TTL = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

const durationToMs = (value = DEFAULT_REFRESH_TTL) => {
  if (!value) {
    return 30 * 24 * 60 * 60 * 1000;
  }
  const match = /^(\d+)(ms|s|m|h|d|w)$/i.exec(value.trim());
  if (!match) {
    return Number(value) || 30 * 24 * 60 * 60 * 1000;
  }
  const [, amount, unit] = match;
  const map = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
  };
  return Number(amount) * map[unit.toLowerCase()];
};

const getExpiryDate = () => new Date(Date.now() + durationToMs());

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  path: COOKIE_PATH,
  maxAge: durationToMs(),
});

const setRefreshTokenCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, getCookieOptions());
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie(COOKIE_NAME, { path: COOKIE_PATH });
};

const createRefreshToken = async ({ userId, userAgent, ipAddress, meta }) => {
  const tokenId = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
  const rawSecret = crypto.randomBytes(64).toString('hex');
  const token = `${tokenId}.${rawSecret}`;
  const tokenHash = await bcrypt.hash(rawSecret, 10);
  const expiresAt = getExpiryDate();

  await RefreshToken.create({
    id: tokenId,
    user_id: userId,
    token_hash: tokenHash,
    user_agent: userAgent?.slice(0, 255),
    ip_address: ipAddress?.slice(0, 64),
    expires_at: expiresAt,
    metadata: meta || null,
  });

  return { token, expiresAt };
};

const parseCompositeToken = (token = '') => {
  const [id, rawToken] = token.split('.');
  if (!id || !rawToken) return null;
  return { id, rawToken };
};

const findTokenRecord = async (token) => {
  const parsed = parseCompositeToken(token);
  if (!parsed) return null;
  const record = await RefreshToken.findByPk(parsed.id);
  if (!record || record.revoked_at) return null;
  if (record.expires_at && dayjs(record.expires_at).isBefore(dayjs())) {
    return null;
  }
  const isValid = await bcrypt.compare(parsed.rawToken, record.token_hash);
  if (!isValid) {
    return null;
  }
  return record;
};

const revokeTokenById = async (id) => {
  await RefreshToken.update(
    { revoked_at: new Date() },
    {
      where: { id, revoked_at: null },
    },
  );
};

const revokeAllUserTokens = async (userId) => {
  await RefreshToken.update(
    { revoked_at: new Date() },
    {
      where: { user_id: userId, revoked_at: null },
    },
  );
};

module.exports = {
  COOKIE_NAME,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  createRefreshToken,
  findTokenRecord,
  revokeTokenById,
  revokeAllUserTokens,
};
