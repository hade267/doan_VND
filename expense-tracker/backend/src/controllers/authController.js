const crypto = require('crypto');
const dayjs = require('dayjs');
const { User, Category, DefaultCategory, sequelize } = require('../models');
const { generateToken } = require('../utils/jwt');
const {
  createRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  findTokenRecord,
  revokeTokenById,
  COOKIE_NAME,
} = require('../utils/tokenService');

const MAX_FAILED_ATTEMPTS = Number(process.env.AUTH_MAX_FAILED_ATTEMPTS || 5);
const LOCKOUT_MINUTES = Number(process.env.AUTH_LOCKOUT_MINUTES || 15);
const VERIFICATION_EXPIRES_HOURS = Number(process.env.AUTH_VERIFICATION_TTL_HOURS || 24);

const buildUserPayload = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  full_name: user.full_name,
  role: user.role,
});

const issueSession = async ({ user, req, res }) => {
  const { token } = await createRefreshToken({
    userId: user.id,
    userAgent: req.get('user-agent'),
    ipAddress: req.ip,
  });
  setRefreshTokenCookie(res, token);
  const accessToken = generateToken({ id: user.id, role: user.role });
  return { accessToken };
};

const authController = {
  async register(req, res) {
    const { username, email, password, full_name } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists.', field: 'email' });
    }
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(409).json({ message: 'Username already exists.', field: 'username' });
    }

    const transaction = await sequelize.transaction();

    try {
      const verificationToken = crypto.randomBytes(40).toString('hex');
      const verificationExpires = dayjs().add(VERIFICATION_EXPIRES_HOURS, 'hour').toDate();

      const newUser = await User.create(
        {
          username,
          email,
          password_hash: password,
          full_name,
          verification_token: verificationToken,
          verification_token_expires: verificationExpires,
          email_verified: false,
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

      const responsePayload = {
        message: 'User registered successfully. Please verify your email before logging in.',
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
        },
      };

      if (process.env.NODE_ENV !== 'production') {
        responsePayload.devVerificationToken = verificationToken;
      }

      console.info('[Auth] Verification token issued', { userId: newUser.id });

      res.status(201).json(responsePayload);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async login(req, res) {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Email not found.', field: 'email' });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: 'Account is deactivated.', field: 'email' });
    }

    if (user.lockout_until && dayjs(user.lockout_until).isAfter(dayjs())) {
      return res.status(423).json({
        message: 'Account temporarily locked due to repeated failed attempts. Please try again later.',
        field: 'email',
      });
    }

    if (!user.email_verified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.', field: 'email' });
    }

    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      user.failed_login_attempts += 1;
      let locked = false;
      if (user.failed_login_attempts >= MAX_FAILED_ATTEMPTS) {
        user.lockout_until = dayjs().add(LOCKOUT_MINUTES, 'minute').toDate();
        user.failed_login_attempts = 0;
        locked = true;
      }
      await user.save();
      return res.status(locked ? 423 : 401).json({
        message: locked ? 'Too many failed attempts. Account locked temporarily.' : 'Invalid credentials.',
        field: locked ? 'email' : 'password',
      });
    }

    user.failed_login_attempts = 0;
    user.lockout_until = null;
    await user.save();

    const { accessToken } = await issueSession({ user, req, res });
    res.status(200).json({
      message: 'Logged in successfully!',
      accessToken,
      user: buildUserPayload(user),
    });
  },

  async refreshToken(req, res) {
    const refreshToken = req.cookies?.[COOKIE_NAME];
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token missing.' });
    }

    try {
      const storedToken = await findTokenRecord(refreshToken);
      if (!storedToken) {
        clearRefreshTokenCookie(res);
        return res.status(401).json({ message: 'Invalid refresh token.' });
      }

      const user = await User.findByPk(storedToken.user_id);
      if (!user || !user.is_active || !user.email_verified) {
        await revokeTokenById(storedToken.id);
        clearRefreshTokenCookie(res);
        return res.status(401).json({ message: 'User is inactive or not found.', field: 'email' });
      }

      await revokeTokenById(storedToken.id);
      const { accessToken } = await issueSession({ user, req, res });

      return res.json({
        accessToken,
        user: buildUserPayload(user),
      });
    } catch (error) {
      clearRefreshTokenCookie(res);
      return res.status(500).json({ message: 'Failed to refresh token.', error: error.message });
    }
  },

  async logout(req, res) {
    const refreshToken = req.cookies?.[COOKIE_NAME];
    if (refreshToken) {
      const storedToken = await findTokenRecord(refreshToken);
      if (storedToken) {
        await revokeTokenById(storedToken.id);
      }
    }
    clearRefreshTokenCookie(res);
    res.status(204).send();
  },

  async verifyEmail(req, res) {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required.' });
    }

    const user = await User.findOne({ where: { verification_token: token } });
    if (!user || !user.verification_token_expires || dayjs(user.verification_token_expires).isBefore(dayjs())) {
      return res.status(400).json({ message: 'Token is invalid or has expired.' });
    }

    user.email_verified = true;
    user.verification_token = null;
    user.verification_token_expires = null;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now log in.' });
  },
};

module.exports = authController;
