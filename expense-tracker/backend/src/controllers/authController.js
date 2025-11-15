const {
  User,
  Category,
  DefaultCategory,
  sequelize,
} = require('../models');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const {
  generateToken,
  verifyToken,
  generateTwoFactorToken,
  verifyTwoFactorToken,
} = require('../utils/jwt');
const {
  createSession,
  findValidSession,
  revokeSession,
  rotateSession,
  revokeAllSessions,
} = require('../services/sessionService');
const { setAuthCookies, clearAuthCookies } = require('../utils/cookies');
const { logAuditEvent } = require('../services/auditService');

const TWO_FACTOR_ISSUER = process.env.TWO_FACTOR_ISSUER || 'MoneyWave';

const buildUserPayload = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role,
  twoFactorEnabled: Boolean(user.two_factor_enabled),
});

const createTokenPair = (user) => ({
  accessToken: generateToken({ id: user.id, role: user.role }),
  refreshToken: generateToken({ id: user.id, role: user.role }, true),
});

const sendAuthResponse = async ({ user, req, res, statusCode, message, auditAction }) => {
  const tokens = createTokenPair(user);
  const session = await createSession({
    userId: user.id,
    refreshToken: tokens.refreshToken,
    userAgent: req.get('user-agent'),
    ipAddress: req.ip,
  });
  setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

  await logAuditEvent(req, user.id, auditAction || 'auth_success', {
    sessionId: session?.id,
  });

  return res.status(statusCode).json({
    message,
    user: buildUserPayload(user),
  });
};

const authController = {
  async register(req, res) {
    const { username, email, password, full_name } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    const transaction = await sequelize.transaction();

    try {
      const newUser = await User.create(
        {
          username,
          email,
          password_hash: password,
          full_name,
        },
        { transaction },
      );

      const defaultCategories = await DefaultCategory.findAll();
      const userCategories = defaultCategories.map((cat) => ({
        name: cat.name,
        type: cat.type,
        icon: cat.icon,
        color: cat.color,
        is_default: false,
        user_id: newUser.id,
      }));

      await Category.bulkCreate(userCategories, { transaction });
      await transaction.commit();

      return sendAuthResponse({
        user: newUser,
        req,
        res,
        statusCode: 201,
        message: 'User registered successfully!',
        auditAction: 'user_register',
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async login(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      await logAuditEvent(req, user.id, 'login_failed');
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'Account is deactivated.' });
    }

    if (user.two_factor_enabled) {
      const twoFactorToken = generateTwoFactorToken({ id: user.id });
      await logAuditEvent(req, user.id, 'login_2fa_challenge');
      return res.status(200).json({ requiresTwoFactor: true, twoFactorToken });
    }

    return sendAuthResponse({
      user,
      req,
      res,
      statusCode: 200,
      message: 'Logged in successfully!',
      auditAction: 'login_success',
    });
  },

  async verifyTwoFactor(req, res) {
    const { token, code } = req.body;
    if (!token || !code) {
      return res.status(400).json({ message: 'Missing token or code.' });
    }

    const decoded = verifyTwoFactorToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Two-factor session expired. Please login again.' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user || !user.two_factor_enabled || !user.two_factor_secret) {
      return res.status(400).json({ message: 'Two-factor authentication is not enabled.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'Account is deactivated.' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!verified) {
      await logAuditEvent(req, user.id, 'login_2fa_failed');
      return res.status(401).json({ message: 'Invalid verification code.' });
    }

    return sendAuthResponse({
      user,
      req,
      res,
      statusCode: 200,
      message: 'Two-factor verification successful!',
      auditAction: 'login_success',
    });
  },

  async refresh(req, res) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Missing refresh token.' });
    }

    const decoded = verifyToken(refreshToken, true);
    if (!decoded) {
      await revokeSession(await findValidSession(refreshToken));
      clearAuthCookies(res);
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }

    const session = await findValidSession(refreshToken);
    if (!session) {
      clearAuthCookies(res);
      return res.status(401).json({ message: 'Refresh token revoked or expired.' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      await revokeSession(session);
      clearAuthCookies(res);
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    if (!user.is_active) {
      await revokeSession(session);
      clearAuthCookies(res);
      return res.status(403).json({ message: 'Account is deactivated.' });
    }

    const tokens = createTokenPair(user);
    await rotateSession(session, tokens.refreshToken);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    await logAuditEvent(req, user.id, 'session_refresh', { sessionId: session.id });

    return res.status(200).json({
      message: 'Session refreshed successfully.',
      user: buildUserPayload(user),
    });
  },

  async logout(req, res) {
    const refreshToken = req.cookies?.refreshToken;
    let decoded;
    if (refreshToken) {
      const session = await findValidSession(refreshToken);
      await revokeSession(session);
      decoded = verifyToken(refreshToken, true);
    }
    clearAuthCookies(res);
    await logAuditEvent(req, decoded?.id || req.user?.id, 'logout');
    return res.status(200).json({ message: 'Logged out successfully.' });
  },

  async logoutAll(req, res) {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await revokeAllSessions(req.user.id);
    clearAuthCookies(res);
    await logAuditEvent(req, req.user.id, 'logout_all');
    return res.status(200).json({ message: 'Logged out from all devices.' });
  },

  async initiateTwoFactorSetup(req, res) {
    const user = await User.findByPk(req.user.id);
    const secret = speakeasy.generateSecret({
      name: `${TWO_FACTOR_ISSUER} (${user.email})`,
      length: 32,
    });

    await user.update({ two_factor_temp_secret: secret.base32 });
    const qrCode = await qrcode.toDataURL(secret.otpauth_url);

    return res.json({
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
      qrCode,
    });
  },

  async enableTwoFactor(req, res) {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Verification code is required.' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user.two_factor_temp_secret) {
      return res.status(400).json({ message: 'No pending 2FA setup found.' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_temp_secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    await user.update({
      two_factor_secret: user.two_factor_temp_secret,
      two_factor_temp_secret: null,
      two_factor_enabled: true,
    });
    await logAuditEvent(req, user.id, '2fa_enabled');

    return res.json({
      message: 'Two-factor authentication enabled successfully.',
      user: buildUserPayload(user),
    });
  },

  async disableTwoFactor(req, res) {
    const { code } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user.two_factor_enabled || !user.two_factor_secret) {
      return res.status(400).json({ message: 'Two-factor authentication is not enabled.' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    await user.update({
      two_factor_secret: null,
      two_factor_temp_secret: null,
      two_factor_enabled: false,
    });
    await logAuditEvent(req, user.id, '2fa_disabled');

    return res.json({
      message: 'Two-factor authentication disabled.',
      user: buildUserPayload(user),
    });
  },
};

module.exports = authController;
