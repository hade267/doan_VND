const crypto = require('crypto');
const dayjs = require('dayjs');
const { Op } = require('sequelize');
const { UserSession } = require('../models');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const refreshTtlDays = () => {
  const parsed = Number(process.env.REFRESH_TOKEN_TTL_DAYS || 7);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 7;
};

const createSession = async ({ userId, refreshToken, userAgent, ipAddress }) => {
  return UserSession.create({
    user_id: userId,
    token_hash: hashToken(refreshToken),
    user_agent: userAgent?.slice(0, 512) || null,
    ip_address: ipAddress || null,
    expires_at: dayjs().add(refreshTtlDays(), 'day').toDate(),
  });
};

const findValidSession = async (refreshToken) => {
  if (!refreshToken) return null;
  const tokenHash = hashToken(refreshToken);

  return UserSession.findOne({
    where: {
      token_hash: tokenHash,
      revoked_at: { [Op.is]: null },
      expires_at: {
        [Op.gt]: new Date(),
      },
    },
  });
};

const revokeSession = async (session) => {
  if (!session) return;
  session.revoked_at = new Date();
  await session.save();
};

const rotateSession = async (session, newRefreshToken) => {
  if (!session) {
    throw new Error('Session not found during rotation');
  }
  session.token_hash = hashToken(newRefreshToken);
  session.expires_at = dayjs().add(refreshTtlDays(), 'day').toDate();
  await session.save();
};

const revokeAllSessions = async (userId) => {
  if (!userId) return;
  await UserSession.update(
    { revoked_at: new Date() },
    {
      where: {
        user_id: userId,
        revoked_at: { [Op.is]: null },
      },
    },
  );
};

module.exports = {
  createSession,
  findValidSession,
  revokeSession,
  rotateSession,
  revokeAllSessions,
};
